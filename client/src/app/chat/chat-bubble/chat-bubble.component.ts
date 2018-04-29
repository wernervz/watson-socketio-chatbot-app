import { Component, OnInit, Input } from '@angular/core';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';

import { ChatControlService } from '../shared/chat-control.service';
import { Utterance } from '../shared/utterance.class';

@Component({
  selector: 'chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss'],
  animations: [
    trigger('flyIn', [
      state('watson', style({transform: 'translateX(0)'})),
      transition('void => watson', [
        animate(500, keyframes([
          style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ]),
      state('human', style({transform: 'translateX(0)'})),
      transition('void => human', [
        animate(500, keyframes([
          style({opacity: 0, transform: 'translateX(100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(-15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ])
    ]),
  ]
})
export class ChatBubbleComponent implements OnInit {

  @Input() utterance:Utterance;

  constructor(private chatControl:ChatControlService) { }

  ngOnInit() {
  }

  onChoice(choice) {
    this.utterance.type = 'text'
    this.chatControl.addHumanUtterance(choice)
  }

}
