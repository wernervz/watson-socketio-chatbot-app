'use strict';

require('./utils/environment')

const LOG = require('winston')

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;
});

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    LOG.info('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      LOG.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

if (require.main === module) {
  // Start the server and the socket io server
  app.io = require('socket.io')(app.start())
  require('socketio-auth')(app.io, {
    authenticate: (socket, value, callback) => {
      LOG.info('In Socket Authentication....')

      var AccessToken = app.models.AccessToken
      // get credentials sent by the client
      var token = AccessToken.find({
        where: {
          and: [{ userId: value.userId }, { id: value.token }]
        }
      }, (err, tokenDetail) => {
        if (err) throw err;
        if (tokenDetail.length) {
          callback(null, { type: 'authentication', authenticated: true });
        } else {
          callback(null, { type: 'authentication', authenticated: false });
        }
      })
    } 
  })
}
