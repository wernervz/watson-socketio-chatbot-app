'use strict';

const LOG = require('winston')
const app = require('../server')
const async = require('async')
const weatherUtils = require('./utils/weather-utils')

const AssistantV1 = require('watson-developer-cloud/assistant/v1')

const assistant = new AssistantV1({
  username: process.env.ASSISTANT_API_USERNAME,
  password: process.env.ASSISTANT_API_PASSWORD,
  url: 'https://gateway.watsonplatform.net/assistant/api/',
  version: '2018-02-16'
})

const clientRequestQueue = {

}

module.exports = function(Assistant) {
    // This function will be executed from the Socket.io message event handler
    // that is defined in the boot/socket-io-handler.js script.
    Assistant.sendMessage = function (conversation, cb) {
        // Emmediatly respond back as we will respond with the socket when done.
        // This cb() is returning to the Socket.io message event handler in the boot/socket-io-handler.js script
        cb()
        // Now setup and call Watson Assistant with the conversation request
        let params = {
            input: conversation.input,
            context: conversation.context,
            workspace_id: process.env.ASSISTANT_WORKSPACE_ID
        }
        LOG.debug('Sending message to Assistant: ' + conversation.input.text)
        // Call Watson Assistant with the input text...
        assistant.message(params, (err, resp) => {
            if (err) return LOG.error(err)

            LOG.debug('Received a response from Assistant...')
            LOG.debug('Location = ' + resp.context.weatherWhere)

            if (app.io) {
                // If the intent is the weather or a weather parameter has changed...
                if (resp.intents.length > 0 && 
                    (resp.intents[0].intent === 'the-weather' || resp.intents[0].intent === 'change-in-params')) {
                    
                    // Send back the Assistant Response only to the client id in the context
                    // This emit is to respond back to the client with what the dialog returned
                    LOG.debug('Respond back to the client with the Assistant output text: ' + resp.output.text)
                    app.io.to(resp.context.clientId).emit('conversation-reply', resp)            

                    // If the location is specified then call the weather API
                    if (resp.context.weatherWhere) {
                        LOG.info('Checking for weather in ' + resp.context.weatherWhere)
                        LOG.info('Is there another weather request in progress = ' + resp.context.inProgress)
                    
                        setTimeout(() => {
                            LOG.debug('Checking the weather for location ' + resp.context.weatherWhere)
                        
                            weatherUtils.theWeather(resp.context).then(weather => {
                                LOG.debug('Weather retrieved...  Responding back with the weather...')
                                resp.output.text = [ weather ]
                                // Send back the Assistant Response only to the client id in the context
                                // This emit is to respond back to the client what the weather returned
                                app.io.to(resp.context.clientId).emit('conversation-reply', resp)
                            })
                        }, 5000)

                    }

                } else {
                    // Not weather related, so just respond back with what assist returned.
                    app.io.to(resp.context.clientId).emit('conversation-reply', resp)    
                }
            }
        })
    }
};
