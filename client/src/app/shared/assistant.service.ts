import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { LoopbackAuthService } from '../auth/loopback/loopback-auth.service';

import * as io from 'socket.io-client';

@Injectable()
export class AssistantService {

  private client

  constructor(private authService: LoopbackAuthService) { }

  connect() {
    if (this.client) {
      this.client.disconnect()
    }

    this.client = io({})

    let id = this.authService.get().token
    let userId = this.authService.get().id
    this.client.emit('authentication', { id: id, userId: userId });
    this.client.on('authenticated', (success) => {
      console.log('Socket authentication complete: ' + success)
    })
    return new Observable(observer => {
      this.client.on('event', (evt:any) => {
        observer.next(evt)
      });
    })
  }

  send(message) {
    if (!this.client) {
      this.connect()
    }
    this.client.send(message)
  }
}
