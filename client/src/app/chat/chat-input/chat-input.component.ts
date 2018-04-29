import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ChatControlService } from '../shared/chat-control.service';
import { Renderer2 } from '@angular/core/src/render/api';

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent implements OnInit {

  @ViewChild('chatInput') chatInputEle:ElementRef;

  text:string;

  constructor(private chatControl:ChatControlService) { 
    this.chatControl.onChatStateChange().subscribe(_chatState => {
      if (_chatState === 'show') {
        this.chatInputEle.nativeElement.focus();
      }
    })
  }

  ngOnInit() {
  }

  emitKeyPress(e) {
    if (e.code === 'Enter' || e.code === 'enter') {
      this.emitSendMessage()
    }
  }

  emitSendMessage() {
    if (this.text) {
      this.chatControl.addHumanUtterance(this.text)
      this.text = ''  
    }
  }
}
