import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { LandingAnimations } from './landing.animations';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { withLatestFrom, filter, take, takeUntil } from 'rxjs/operators';

import { LandingState } from './+state/landing.state';
import { LandingSelectors } from './+state/landing.selectors';

import { LoadData, Cleanup } from './+state/landing.actions';
import { RouterNavigate } from '../../core/store/app.actions';

import { User } from '../../core/store/user/user.model';
import { Login } from '../../core/store/auth/auth.actions';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LandingAnimations,
})
export class LandingComponent implements OnInit, OnDestroy {
  // --------------- ROUTE PARAMS & CURRENT USER ---------

  /** The currently signed in user. */
  currentUser$: Observable<User> = this.store.pipe(
    select(fromAuth.selectUser),
    filter((user) => user !== null), // null indicates LoadAuth hasn't been processed
  );

  // --------------- LOCAL AND GLOBAL STATE --------------


  // --------------- DB ENTITY DATA ----------------------

  /** Container id for selectors and loading. */
  containerId: string = this.db.createId();

  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------

  /** Login click events. */
  login$: Subject<void> = new Subject<void>();


  // --------------- HELPER FUNCTIONS AND OTHER ----------

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private state: LandingState,
    private route: ActivatedRoute,
    private selectors: LandingSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
  ) {
  }

  ngOnInit() {
    // --------------- EVENT HANDLING ----------------------

    /** Handle login events. */
    this.login$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(new Login({ provider: 'google.com' }));
    });

    // --------------- LOAD DATA ---------------------------

    // Once everything is set up, load the data for the role.
    this.currentUser$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((currentUser) => {
      this.store.dispatch( new LoadData({
        currentUser,
      }, this.containerId) );
    });
  }

  ngOnDestroy() {
    // Unsubscribe subscriptions.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // Unsubscribe from firebase connection from load and free up memoized selector values.
    this.store.dispatch( new Cleanup(this.containerId) );
    this.selectors.cleanup(this.containerId);
  }
}
