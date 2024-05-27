import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of, Observable } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';
import * as fromStore from '../../../core/store/app.reducer';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { EffectsHelpers } from '../../../core/store/effects.helpers';
import { WaitingState } from './waiting.state';

import { ActionFlow, RouterNavigate, LoadAction, Unsubscribe } from '../../../core/store/app.actions';
import { WaitingActionTypes, Cleanup, LoadData } from './waiting.actions';
import { StreamUserContext } from '../../../core/store/user-context/user-context.actions';
import { StreamAppState } from '../../../core/store/app-state/app-state.actions';

@Injectable()
export class WaitingEffects {
  /** Load data from Firebase. */
  loadData$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadData>(WaitingActionTypes.LOAD_DATA),
      mergeMap((action: LoadData) => {
        const loadId = action.correlationId;
        const currentUser = action.payload.currentUser;

        return [
          new StreamUserContext([['__userId', '==', currentUser.__id]], {}, loadId),
          new StreamAppState([['__id', '==', 'app']], {}, loadId),
        ];
      }),
    ),
  );

  /** Unsubscribe connections from Firebase. */
  cleanup$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<Cleanup>(WaitingActionTypes.CLEANUP),
      map((action: Cleanup) => new Unsubscribe(action.correlationId)),
    ),
  );

  constructor(
    private actions$: Actions,
    private store: Store<fromStore.State>,
    private state: WaitingState,
    private db: FirebaseService,
    private eh: EffectsHelpers,
  ) {}
}
