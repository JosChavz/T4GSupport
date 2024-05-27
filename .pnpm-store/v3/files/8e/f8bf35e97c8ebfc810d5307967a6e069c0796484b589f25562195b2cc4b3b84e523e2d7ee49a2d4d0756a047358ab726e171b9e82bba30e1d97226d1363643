import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as fromStore from './core/store/app.reducer';
import { LoadAuth } from './core/store/auth/auth.actions';
import { RoutingStateService } from './core/router/routing-state.service';
import { TimeAnalyticsService } from './core/analytics/time-analytics.service';
import { DetectRedeploymentService } from './shared/components/redeployment-warning/redeployment-warning.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private routingState: RoutingStateService,
    private store: Store<fromStore.State>,
    private analytics: TimeAnalyticsService,
    private detectRedeployment: DetectRedeploymentService,
  ) {
  }

  ngOnInit() {
    // Load auth into store
    this.store.dispatch( new LoadAuth() );

    // Setup time analytics
    this.analytics.startTimeLogging();

    // Setup RoutingState to enable retrieving the previous Url
    this.routingState.loadRouting();

    // Make it so navigating to a new route scrolls back
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByClassName('content-container')[0].scrollTop = 0;
    });

    // Continually check whether a new app version has been deployed.
    this.detectRedeployment.init();
  }
}
