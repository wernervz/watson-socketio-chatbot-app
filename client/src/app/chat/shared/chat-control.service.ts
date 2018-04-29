import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { Utterance } from './utterance.class';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.class';

@Injectable()
export class ChatControlService {
  
  // Used to control that the chat is only initialized once.
  initialized:boolean = false;

  // Controls whether the chat control is shown or not.
  chatState:string = 'hide';
  chatStateObserver:BehaviorSubject<string> = new BehaviorSubject('hide');

  // The conversation context to be passed back to WCS on subsequent calls.
  context:any;

  // Used to notify any subscribers when a new uttenrance is added to the conversation.
  conversationObserver:Subject<Utterance> = new Subject();
  // An array of utterances as the conversation progress.
  conversation:Array<Utterance> = new Array();

  // Used to notify any subscribers when a new tone is received.
  toneObserver:Subject<string> = new Subject();

  // Config params received from the conversation's Welcome response.  
  // Used to control what else is included in the calls.
  isToneEnabled:boolean = false;

  // Maintain a flag to indicate whether the socket is connected
  isSocketConnected = false
  
  constructor(private conversationSvc:ConversationService) {}

  // Create a socket connection to the server that is authenticated
  // and will receive the Assistant responses when they arrive.
  establishSocketConnection() {
    return new Promise((resolve, reject) => {
      console.log('Establishing Socket Connection...')
      this.conversationSvc.connect().subscribe(response => {
        console.log(response)
        if (response.type && response.type === 'authentication') {
          if (response.authenticated) console.log('Socket was authenticated...')
          this.isSocketConnected = true
        } else if (response.intents) {
          this.initialized = true;
          // Save the context to be sent back in subsequent calls to Assistant
          this.context = response.context;
          // If the last entry in the conversation is a spinner, then remove it from the conversation
          if (this.conversation[this.conversation.length - 1].spinner) {
            this.conversation.pop();            
          }
          // Add the new Watson response to the conversation
          console.log('Adding watson response: ' + response.output.text)
          this.addWatsonUtterance(response.output.text)
        } else {
          console.log('Socket was disconnected due to ' + response)
          this.isSocketConnected = false
          this.conversationSvc.disconnect()
        }    
        resolve()
      })
    })
  }

  // Send a message, via sockets to Watson Assistant.  If not connected, connect the socket first.
  sendConversation(message) {
    // Add the spinner to the chat window
    this.addWatsonUtterance('<i class="fa fa-spinner fa-pulse fa-lg fa-fw"></i>', 'html', true)
    // check if the socket is still connected, otherwise establish the connection
    if (!this.isSocketConnected) {
      this.establishSocketConnection().then(() => {
        // send the message to conversation
        this.conversationSvc.sendMessage(new Conversation(message, this.context))        
      })
    } else {
      this.conversationSvc.sendMessage(new Conversation(message, this.context))
    }
  }

  // Refresh the Conversation and start over.
  refreshConversation() {
    this.conversation = new Array();
    this.context = null;
    this.initialized = false;
    this.sendConversation('')
  }

  // Add a Watson Utterance to the transcript
  addWatsonUtterance(message, type?, spinner?) {
    let watsonUtterance = new Utterance(message, 'watson', type);
    if (spinner) watsonUtterance.spinner = spinner
    this.conversationObserver.next(watsonUtterance);
    this.conversation.push(watsonUtterance)
  }

  // Add a Human utterance to the transcript
  addHumanUtterance(message) {
    let humanUtterance = new Utterance(message, 'human')
    this.conversationObserver.next(humanUtterance)
    this.conversation.push(humanUtterance)    
    this.postHumanUtteranceActions(message)
  }

  // Do this after a human utterance was added to the transcript.  Basically call conversation for a Watson response.
  postHumanUtteranceActions(message, toneResp?) {
    this.sendConversation(message)
  }

  // Returns the Subscription to be notified when an Utterance is added to the transcript.
  onUtterance() {
    return this.conversationObserver;
  }

  // Returns the Subject to be notified when the chat slideout state changes.
  onChatStateChange():BehaviorSubject<string> {
    return this.chatStateObserver;
  }

  // Returns the Subscription to be notified when a new Tone is received.
  onTone() {
    return this.toneObserver;
  }
  
  // Toggles the chat slideout.
  toggleChatState() {
    this.chatState = this.chatState === 'hide' ? 'show' : 'hide';
    this.chatStateObserver.next(this.chatState)
    if (this.chatState === 'show' && !this.initialized) {
      this.sendConversation('')
    }
  }

  // Hide the chat slideout
  setStateHide() {
    this.chatState = 'hide'
    this.chatStateObserver.next('hide')
  }

  // Show the chat slideout
  setStateShow() {
    this.chatState = 'show'
    this.chatStateObserver.next('show')
    if (!this.initialized) {
      this.sendConversation('')
    }
  }

}
