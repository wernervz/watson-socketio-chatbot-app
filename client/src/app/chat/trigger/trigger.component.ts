import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';

import { ChatControlService } from '../shared/chat-control.service'

@Component({
  selector: 'chat-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss']
})
export class TriggerComponent implements OnInit {

  triggerIcon:string = 'fa fa-comments-o';
  
  constructor(public chatControl:ChatControlService) { }

  ngOnInit() {
  }

  toggleChatState() {
    this.chatControl.toggleChatState()
  }

  @HostListener('mouseenter')
  onTriggerMouseEnter() {
    this.triggerIcon = 'fa fa-comments';
  }

  @HostListener('mouseleave')
  onTriggerMouseLeave() {
    this.triggerIcon = 'fa fa-comments-o';
  }
}
