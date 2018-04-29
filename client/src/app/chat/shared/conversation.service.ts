import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/operators';

import { Conversation } from './conversation.class';
import { LoopbackAuthService } from '../../auth/loopback/loopback-auth.service';

import * as io from 'socket.io-client';

@Injectable()
export class ConversationService {

  private client

  constructor(private authService:LoopbackAuthService) { }

  connect():Observable<any> {
    if (this.client) {
      console.log('Client had a previous connection to the server, disconnecting before creating a new connection...')
      this.client.disconnect()
    }

    this.client = io({})

    let token = this.authService.get().token
    let userId = this.authService.get().id
    
    this.client.emit('authentication', { token: token, userId: userId });

    // Create an Observable for authentication, disconnnect and receiving the conversation replies.
    const authentication = fromEvent(this.client, 'authenticated')
    const conversation = fromEvent(this.client, 'conversation-reply')
    const disconnect = fromEvent(this.client, 'disconnect')
    // Then merge the 2 observebles that will be subscibed to in the controller
    return authentication.pipe(merge(conversation, disconnect))

  }

  disconnect() {
    this.client.disconnect()
    this.client = null
  }

  sendMessage(conversation:Conversation) {
    if (!conversation.context) {
      conversation.context = {}
    }
    conversation.context.clientId = this.client.json.id
    this.client.send(conversation)
  }

}
