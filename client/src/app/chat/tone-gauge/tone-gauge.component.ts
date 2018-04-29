import { Component, OnInit } from '@angular/core';
import { ChatControlService } from '../shared/chat-control.service';

@Component({
  selector: 'chat-tone-gauge',
  templateUrl: './tone-gauge.component.html',
  styleUrls: ['./tone-gauge.component.scss']
})
export class ToneGaugeComponent implements OnInit {

  constructor(private chatControl: ChatControlService) { }

  toneColor:string = 'linear-gradient(-90deg, #296cb9, white)'

  ngOnInit() {
    this.chatControl.onTone().subscribe(tone => {
      switch(tone) {
        case 'refresh': {
          this.toneColor = 'linear-gradient(-90deg, #296cb9, white)'
          break
        }
        case 'satisfied':
        case 'excited':
        case 'polite':
        case 'sympathetic': {
          this.toneColor = 'linear-gradient(-90deg, green, white)'
          break
        }
        case 'impolite': 
        case 'sad': {
          this.toneColor = 'linear-gradient(-90deg, orange, white)'
          break
        }
        case 'frustrated': {
          this.toneColor = 'linear-gradient(-90deg, red, white)'
          break
        }
      }
    })
  }

}
