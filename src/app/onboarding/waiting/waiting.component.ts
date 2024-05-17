import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { WaitingAnimations } from './waiting.animations';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { withLatestFrom, filter, take, takeUntil } from 'rxjs/operators';

import { WaitingState } from './+state/waiting.state';
import { WaitlistData } from './+state/waiting.model';
import { WaitingSelectors } from './+state/waiting.selectors';

import { LoadData, Cleanup } from './+state/waiting.actions';
import { ActionFlow, RouterNavigate, ActionSet } from '../../core/store/app.actions';
import { ShowSnackbar } from '../../core/snackbar/snackbar.actions';

import { User, AccessState } from '../../core/store/user/user.model';
import { UpdateUser, UserActionTypes } from '../../core/store/user/user.actions';
import { UserContext } from '../../core/store/user-context/user-context.model';
import { UpdateUserContext, AddUserContext, UserContextActionTypes } from '../../core/store/user-context/user-context.actions';
import { AppState } from '../../core/store/app-state/app-state.model';
import { UpdateAppState, AddAppState, AppStateActionTypes } from '../../core/store/app-state/app-state.actions';

import { Timestamp } from 'firebase/firestore';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WaitingAnimations,
})
export class WaitingComponent implements OnInit, OnDestroy {
  // --------------- ROUTE PARAMS & CURRENT USER ---------

  /** The currently signed in user. */
  currentUser$: Observable<User> = this.store.pipe(
    select(fromAuth.selectUser),
    filter((user) => user !== null), // null indicates LoadAuth hasn't been processed
  );

  // --------------- LOCAL AND GLOBAL STATE --------------

  // this allows the template to use the enum
  AccessState = AccessState;

  // Template constants
  appName = 'APP_NAME [Causeway]';
  appArea = 'APP_AREA [learning web development]';
  backgroundAndInterestsOptions = [
    { fieldName: 'option1', label: 'OPTION_1 [Student trying to get hands-on experience]', ariaLabel: 'OPTION_1_ARIA' },
    { fieldName: 'option2', label: 'OPTION_2 [Educator exploring new ways to teach]', ariaLabel: 'OPTION_2_ARIA' },
    { fieldName: 'option3', label: 'OPTION_3 [Professional wanting to contribute to a cause]', ariaLabel: 'OPTION_3_ARIA' },
    { fieldName: 'other', label: 'Other (none are a perfect fit)', ariaLabel: 'Other' },
  ];
  outreachLeadName = 'OUTREACH_LEAD_NAME [FirstName LastName]';
  outreachLeadEmail = 'OUTREACH_LEAD_EMAIL [email@ucsc.edu]';

  // Form variables
  desiredValue = '';
  backgroundOther = '';
  backgroundSelections = this.form.group({
    option1: false,
    option2: false,
    option3: false,
    other: false,
  });

  // --------------- DB ENTITY DATA ----------------------

  /** Container id for selectors and loading. */
  containerId: string = this.db.createId();

  /** Waitlist data from app-state, user, and user-context. */
  waitlistData$: Observable<WaitlistData> = this.selectors.getWaitlistData(this.currentUser$, this.containerId);

  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------

  /** Event stream for submitting interest. */
  submitInterest$: Subject<void> = new Subject<void>();

  /** Event stream for submitting detailed context. */
  submitDetailed$: Subject<void> = new Subject<void>();

  // --------------- HELPER FUNCTIONS AND OTHER ----------

  /** Function for adding the appropriate suffix. */
  nth(n: number) {
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  }

  /** Get all options that were selected. */
  getSelections(): string[] {
    return Object.keys(this.backgroundSelections.value).filter((key) => this.backgroundSelections.value[key]);
  }

  /** Loading indicator. */
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private state: WaitingState,
    private route: ActivatedRoute,
    private selectors: WaitingSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
    private form: FormBuilder,
  ) {
  }

  ngOnInit() {
    // --------------- EVENT HANDLING ----------------------

    this.submitInterest$.pipe(
      withLatestFrom(this.waitlistData$),
      takeUntil(this.unsubscribe$),
    ).subscribe(([_, waitlistData]) => {
      const actionSets: ActionSet[] = [{
        action: new UpdateUser(waitlistData.currentUser.__id, {
          accessState: AccessState.SUBMIT_DETAILED,
        }, this.containerId),
        responseActionTypes: {
          success: UserActionTypes.UPDATE_SUCCESS,
          failure: UserActionTypes.UPDATE_FAIL,
        },
      }];

      if (waitlistData.userContext) {
        actionSets.push({
          action: new UpdateUserContext(waitlistData.userContext.__id, {
            background: {
              selections: this.getSelections(),
              ...(this.backgroundOther ? { other: this.backgroundOther } : { }),
            },
            desiredValue: this.desiredValue,
          }, this.containerId),
          responseActionTypes: {
            success: UserContextActionTypes.UPDATE_SUCCESS,
            failure: UserContextActionTypes.UPDATE_FAIL,
          },
        });
      } else {
        actionSets.push({
          action: new AddUserContext({
            __id: this.db.createId(),
            __userId: waitlistData.currentUser.__id,
            background: {
              selections: this.getSelections(),
              ...(this.backgroundOther ? { other: this.backgroundOther } : { }),
            },
            desiredValue: this.desiredValue,
          }, this.containerId),
          responseActionTypes: {
            success: UserContextActionTypes.ADD_SUCCESS,
            failure: UserContextActionTypes.ADD_FAIL,
          },
        });
      }

      this.store.dispatch(
        new ActionFlow({
          actionSets,
          loading$: this.loading$,
          successActionFn: (actionSetResponses) => {
            return [];
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

    this.submitDetailed$.pipe(
      withLatestFrom(this.waitlistData$),
      takeUntil(this.unsubscribe$),
    ).subscribe(([_, waitlistData]) => {
      // TODO: Need to implement a cloud function to update all position numbers
      // when we take someone off the waitlist (decrement everyone who joined after them)
      const actionSets: ActionSet[] = [{
        action: new UpdateUser(waitlistData.currentUser.__id, {
          accessState: AccessState.WAITING,
          positionNumber: waitlistData.appState ? waitlistData.appState._totalWaiting + 1 : 1,
          joinedWaitlistAt: Timestamp.fromDate(new Date()),
        }, this.containerId),
        responseActionTypes: {
          success: UserActionTypes.UPDATE_SUCCESS,
          failure: UserActionTypes.UPDATE_FAIL,
        },
      }, {
        action: new UpdateUserContext(waitlistData.userContext.__id, {
          // Add relevant fields from detailed responses
        }, this.containerId),
        responseActionTypes: {
          success: UserContextActionTypes.UPDATE_SUCCESS,
          failure: UserContextActionTypes.UPDATE_FAIL,
        },
      }];

      if (waitlistData.appState) {
        actionSets.push({
          action: new UpdateAppState(waitlistData.appState.__id, {
            _totalWaiting: waitlistData.appState._totalWaiting + 1,
          }, this.containerId),
          responseActionTypes: {
            success: AppStateActionTypes.UPDATE_SUCCESS,
            failure: AppStateActionTypes.UPDATE_FAIL,
          },
        });
      } else {
        actionSets.push({
          action: new AddAppState({
            __id: 'app',
            _totalWaiting: 1,
          }, this.containerId),
          responseActionTypes: {
            success: AppStateActionTypes.ADD_SUCCESS,
            failure: AppStateActionTypes.ADD_FAIL,
          },
        });
      }

      this.store.dispatch(
        new ActionFlow({
          actionSets,
          loading$: this.loading$,
          successActionFn: (actionSetResponses) => {
            return [];
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
    this.currentUser$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((currentUser) => {
      this.store.dispatch(
        new LoadData({ currentUser }, this.containerId),
      );
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
