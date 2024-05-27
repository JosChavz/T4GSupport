import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of, Observable } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';
import * as fromStore from '../../../core/store/app.reducer';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { EffectsHelpers } from '../../../core/store/effects.helpers';
import { WaitlistState } from './waitlist.state';

import { ActionFlow, RouterNavigate, LoadAction, Unsubscribe } from '../../../core/store/app.actions';
import { WaitlistActionTypes, Cleanup, LoadData } from './waitlist.actions';
import { AccessState } from '../../../core/store/user/user.model';
import { StreamUser } from '../../../core/store/user/user.actions';

@Injectable()
export class WaitlistEffects {
  /** Load data from Firebase. */
  loadData$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadData>(WaitlistActionTypes.LOAD_DATA),
      mergeMap((action: LoadData) => {
        const loadId = action.containerId;

        return [
          new StreamUser([], {}, loadId),
        ];
      }),
    ),
  );

  /** Unsubscribe connections from Firebase. */
  cleanup$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<Cleanup>(WaitlistActionTypes.CLEANUP),
      map((action: Cleanup) => new Unsubscribe(action.containerId)),
    ),
  );

  constructor(
    private actions$: Actions,
    private store: Store<fromStore.State>,
    private state: WaitlistState,
    private db: FirebaseService,
    private eh: EffectsHelpers,
  ) {}
}
