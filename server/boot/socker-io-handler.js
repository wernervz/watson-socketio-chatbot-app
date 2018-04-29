'user strict'

var LOG = require('winston')

// This boot script setup the action that will be taken when a socket message
// is received from the client.
module.exports = function (app) {
    // Do something when someone connects as a socket client
  app.io.on('connection', (socket) => {
    LOG.debug('Subscription request received...')

    // When a client send a message to the service, it will be handled here
    socket.on('message', (conversation) => {
      // On receiving a message from the client, forward it to the Assistant model sendMessage script
      app.models.Assistant.sendMessage(conversation, (err) => {
        if (err) LOG.error(err)
      })
    })

    socket.on('disconnect', () => {
      LOG.debug('Client is disconnecting...');
    })
  })
}