import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../../core/store/app.reducer';
import { EntitySelectorService } from '../../../core/store/app.selectors';

import { Observable, of, combineLatest } from 'rxjs';
import { bufferTime, distinctUntilChanged, shareReplay, mergeMap, filter, switchMap, map } from 'rxjs/operators';
import { User, AccessState } from '../../../core/store/user/user.model';
import { WaitlistData } from './waiting.model';

@Injectable({
  providedIn: 'root',
})
export class WaitingSelectors {
  constructor(
    private slRx: EntitySelectorService,
  ) { }

  /** Get waitlist data from store. */
  getWaitlistData(currentUser$: Observable<User>, cId: string): Observable<WaitlistData> {
    return combineLatest([
      this.slRx.selectAppStates([['__id', '==', 'app']], cId).pipe(map((x) => x.length > 0 ? x[0] : undefined)),
      currentUser$,
    ]).pipe(
      switchMap(([appState, currentUser]) => {
        return this.slRx.selectUserContexts([['__userId', '==', currentUser.__id]], cId).pipe(
          map((userContexts) => {
            if (userContexts.length > 0) {
              return { currentUser, userContext: userContexts[0], appState };
            } else {
              return { currentUser, userContext: undefined, appState };
            }
          }),
        );
      }),
    );
  }

  cleanup(cId: string) {
    this.slRx.release(cId);
  }
}
