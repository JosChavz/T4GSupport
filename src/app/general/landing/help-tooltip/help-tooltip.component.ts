import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { HelpTooltipAnimations } from './help-tooltip.animations';

@Component({
  selector: 'app-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: HelpTooltipAnimations,
})
export class HelpTooltipComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------
  @Output()
  closeEmitter = new EventEmitter<void>();

  // --------------- LOCAL AND GLOBAL STATE --------------


  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------
  close() {
    console.log('close');
    this.closeEmitter.emit();
  }

  // --------------- HELPER FUNCTIONS AND OTHER ----------

  constructor() { }

  ngOnInit(): void {
  }
}
