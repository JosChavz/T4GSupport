import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ConsentAnimations } from './consent.animations';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { withLatestFrom, filter, take, takeUntil } from 'rxjs/operators';

import { ConsentState } from './+state/consent.state';
import { ConsentSelectors } from './+state/consent.selectors';

import { LoadData, Cleanup } from './+state/consent.actions';
import { ActionFlow, RouterNavigate } from '../../core/store/app.actions';
import { ShowSnackbar } from '../../core/snackbar/snackbar.actions';

import { User, AccessState } from '../../core/store/user/user.model';
import { UpdateUser, UserActionTypes } from '../../core/store/user/user.actions';
import { Location, PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: ConsentAnimations,
})
export class ConsentComponent implements OnInit, OnDestroy {
  // --------------- ROUTE PARAMS & CURRENT USER ---------

  /** The currently signed in user. */
  currentUser$: Observable<User> = this.store.pipe(
    select(fromAuth.selectUser),
    filter((user) => user !== null),
  );

  // --------------- LOCAL AND GLOBAL STATE --------------

  /** String constants. */
  appName = 'APP_NAME [Causeway]';
  shortProdDesc = 'PROD_DESC [provides users with opportunities to learn coding in real-world settings while contributing to non-profit causes]';
  shortResearchDesc = 'RESEARCH_DESC [how to scale opportunities for experiential learning and support collaboration around social causes]';
  authAppName = 'AUTH_APP_NAME [Google]';
  protocolNumber = 'PROTOCOL_NO [HS-FY2022-254]';
  protocolTitle = 'PROTOCOL_TITLE [Scaling Experiential Learning of Web Development]';
  usageDataProductDesc = 'USAGE_DATA_PROD [help users learn and contribute to projects they are participating in. When you participate in a project, your task information, status, and code will be shared with the project team]';
  usageDataResearchDesc = 'USAGE_DATA_RESEARCH [how to better support experiential learning online]';
  studyDoingDesc = 'STUDY_DOING [When you participate in our study, you will use our platform to learn web development and contribute code to a platform. You will also fill out a survey on your experience, and optionally, participate in a follow-up interview]';
  benefitsDesc = 'STUDY_BENEFITS [to learn web development and contribute to a project you care about]';
  investigatorInfo = 'INVESTIGATOR_INFO [FirstName LastName, co-Principal Investigator, email@ucsc.edu]';
  facultyInfo = 'FACULTY_INFO [David T. Lee, dlee105@ucsc.edu]';

  /** Checkbox state used in form. */
  checked: boolean;

  /** Consent url. */
  consentUrl;

  // --------------- DB ENTITY DATA ----------------------

  /** Container id for selectors and loading. */
  containerId: string = this.db.createId();

  // --------------- DATA BINDING ------------------------


  // --------------- EVENT BINDING -----------------------

  /** Event stream for submission events. */
  submit$: Subject<void> = new Subject<void>();

  // --------------- HELPER FUNCTIONS AND OTHER ----------

  /** Loading indicator. */
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private state: ConsentState,
    private route: ActivatedRoute,
    private selectors: ConsentSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
    private platform: PlatformLocation,
    private location: Location,
  ) {
  }

  ngOnInit() {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    this.consentUrl = (this.platform as any).location.origin + '/' + this.location.prepareExternalUrl('consent');

    // --------------- EVENT HANDLING ----------------------


    // Handle submitting the form
    this.submit$.pipe(
      withLatestFrom(this.currentUser$),
      takeUntil(this.unsubscribe$),
    ).subscribe(([_, currentUser]) => {
      const actionSets = [{
        action: new UpdateUser(currentUser.__id, {
          accessState: AccessState.SUBMIT_INTEREST,
          consented: true,
        }, this.containerId),
        responseActionTypes: {
          success: UserActionTypes.UPDATE_SUCCESS,
          failure: UserActionTypes.UPDATE_FAIL,
        },
      }];

      this.store.dispatch(
        new ActionFlow({
          actionSets,
          loading$: this.loading$,
          successActionFn: (actionSetResponses) => {
            return [
              new RouterNavigate(['/onboarding/waiting']),
            ];
          },
          failActionFn: (actionSetResponses) => {
            return [
              new ShowSnackbar({
                message: 'Failed to update consent status',
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
