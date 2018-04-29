import { Component, OnInit, Inject } from '@angular/core';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';

import { APP_CONFIG, AppConfig } from '../../config/app-config.module';

import { ChatControlService } from '../shared/chat-control.service'

@Component({
  selector: 'chat-slideout',
  templateUrl: './slideout.component.html',
  styleUrls: ['./slideout.component.scss'],
  animations: [
    trigger('slideoutAnimation', [
      state('show', style({
        right: '0px',
      })),
      state('hide', style({
        right: '-375px',
      })),
      transition('* => *', animate('300ms ease-in'))
    ])
  ]
})
export class SlideoutComponent implements OnInit {

  chatState:string

  constructor(private chatControl:ChatControlService, @Inject(APP_CONFIG) public appConfig: AppConfig) { }

  ngOnInit() {
    this.chatControl.onChatStateChange().subscribe(_chatState => {
      this.chatState = _chatState
    })
  }

  onCloseClick() {
    this.chatControl.setStateHide();
  }

  onRefreshClick() {
    this.chatControl.refreshConversation();
  }

}
