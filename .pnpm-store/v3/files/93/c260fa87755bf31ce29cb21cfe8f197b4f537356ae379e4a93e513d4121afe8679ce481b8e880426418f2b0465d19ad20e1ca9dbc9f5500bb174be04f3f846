import { Component, OnInit } from '@angular/core';
import { DetectRedeploymentService } from './redeployment-warning.service';

@Component({
  selector: 'app-redeployment-warning',
  templateUrl: './redeployment-warning.component.html',
  styleUrls: ['./redeployment-warning.component.scss'],
})
export class RedeploymentWarningComponent implements OnInit {
  showRedeploymentWarning: boolean = false;

  constructor(public detectRedeployment: DetectRedeploymentService) {}

  ngOnInit() {
    this.detectRedeployment.redeployed().subscribe(() => {
      this.showRedeploymentWarning = true;
    });
  }

  /** Triggers a refresh. */
  update() {
    this.detectRedeployment.refresh();
  }

  /** Ignores the warning. */
  close() {
    this.showRedeploymentWarning = false;
  }
}
