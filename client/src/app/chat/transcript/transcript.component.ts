import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatControlService } from '../shared/chat-control.service';
import { Utterance } from '../shared/utterance.class';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'chat-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.scss']
})
export class TranscriptComponent implements OnInit {

  @ViewChild('transcript') transcriptEle: ElementRef;

  constructor(public chatControl:ChatControlService) { }

  ngOnInit() {
    this.chatControl.onUtterance().subscribe(() => {
      setTimeout(_ => {
        this.transcriptEle.nativeElement.scrollTop = this.transcriptEle.nativeElement.scrollHeight;        
      }, 250)
    })
  }
}
