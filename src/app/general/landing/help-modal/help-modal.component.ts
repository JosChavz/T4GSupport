import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { HelpModalAnimations } from './help-modal.animations';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: HelpModalAnimations,
})
export class HelpModalComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------


  // --------------- LOCAL AND GLOBAL STATE --------------


  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------


  // --------------- HELPER FUNCTIONS AND OTHER ----------

  constructor() { }

  ngOnInit(): void {
  }
}
