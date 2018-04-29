import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppConfigModule } from '../config/app-config.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TriggerComponent } from './trigger/trigger.component';
import { SlideoutComponent } from './slideout/slideout.component';
import { ChatInputComponent } from './chat-input/chat-input.component';

import { ChatControlService } from './shared/chat-control.service';
import { ChatBubbleComponent } from './chat-bubble/chat-bubble.component';
import { TranscriptComponent } from './transcript/transcript.component'
import { ConversationService } from './shared/conversation.service';
import { ToneGaugeComponent } from './tone-gauge/tone-gauge.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AppConfigModule,
    NgbModule.forRoot()
  ],
  exports: [
    TriggerComponent,
    SlideoutComponent    
  ],
  declarations: [
    TriggerComponent,
    SlideoutComponent,
    ChatInputComponent,
    ChatBubbleComponent,
    TranscriptComponent,
    ToneGaugeComponent
  ],
  providers: [ ChatControlService, ConversationService ]
})
export class ChatModule { }
