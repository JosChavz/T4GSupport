import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { WaitlistAnimations } from './waitlist.animations';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { withLatestFrom, take, takeUntil } from 'rxjs/operators';

import { WaitlistState } from './+state/waitlist.state';
import { WaitlistSelectors } from './+state/waitlist.selectors';

import { LoadData, Cleanup } from './+state/waitlist.actions';
import { ActionFlow, RouterNavigate, ActionSet } from '../../core/store/app.actions';

import { User, AccessState } from '../../core/store/user/user.model';
import { ShowSnackbar } from '../../core/snackbar/snackbar.actions';
import { UpdateUser, UserActionTypes } from '../../core/store/user/user.actions';

// If you add other columns, update this, e.g. AccessState | string | boolean;
type UpdateValueTypes = AccessState;

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WaitlistAnimations,
})
export class WaitlistComponent implements OnInit, OnDestroy {
  // --------------- ROUTE PARAMS & CURRENT USER ---------


  // --------------- LOCAL AND GLOBAL STATE --------------

  /** Access options for menu sorted alphabetically. */
  accessOptions: AccessState[] = Object.keys(AccessState)
    .map((k) => AccessState[k] as AccessState)
    .sort((a, b) => {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    });

  /** Columns to display in the table */
  displayedColumns = ['userName', 'accessState'];

  // --------------- DB ENTITY DATA ----------------------

  /** Container id for selectors and loading. */
  containerId: string = this.db.createId();

  /** Get array of all waiting users. */
  waitingUsers$: Observable<User[]> = this.selectors.selectWaitingUsers(this.containerId);

  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------

  /** Event stream for updating user accessState. */
  updateState$: Subject<{ user: User, key: string, value: UpdateValueTypes }> = new Subject<{ user: User, key: string, value: UpdateValueTypes }>();


  // --------------- HELPER FUNCTIONS AND OTHER ----------

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private state: WaitlistState,
    private route: ActivatedRoute,
    private selectors: WaitlistSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
  ) {
  }

  ngOnInit() {
    // --------------- EVENT HANDLING ----------------------

    this.updateState$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(({ user, key, value }) => {
      const data = {};
      data[key] = value;
      const actionSets: ActionSet[] = [{
        action: new UpdateUser(user.__id, {
          ...data,
        }, this.containerId),
        responseActionTypes: {
          success: UserActionTypes.UPDATE_SUCCESS,
          failure: UserActionTypes.UPDATE_FAIL,
        },
      }];

      this.store.dispatch(
        new ActionFlow({
          actionSets,
          successActionFn: (actionSetResponses) => {
            return [
              new ShowSnackbar({
                message: `Set ${user.name}'s ${key} to ${value}`,
                config: { duration: 3000 },
              }),
            ];
          },
          failActionFn: (actionSetResponses) => {
            return [
              new ShowSnackbar({
                message: 'Failed to submit response',
                config: { duration: 3000 },
              }),
            ];
          },
        }),
      );
    });


    // --------------- LOAD DATA ---------------------------

    // Once everything is set up, load the data for the role.
    this.store.dispatch( new LoadData(this.containerId) );
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
