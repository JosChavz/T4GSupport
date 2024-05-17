import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../../core/store/app.reducer';
import { EntitySelectorService } from '../../../core/store/app.selectors';

import { Observable, of, combineLatest } from 'rxjs';
import { bufferTime, distinctUntilChanged, shareReplay, mergeMap, filter, switchMap, map } from 'rxjs/operators';
import { User, AccessState } from '../../../core/store/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class WaitlistSelectors {
  constructor(
    private slRx: EntitySelectorService,
  ) { }

  /** selector for getting waiting users. */
  selectWaitingUsers(cId: string): Observable<User[]> {
    return this.slRx.selectUsers([], cId).pipe(
      map((users) => {
        users.sort((a, b) => {
          if (a.accessState > b.accessState) {
            return 1;
          } else if (a.accessState < b.accessState) {
            return -1;
          } else {
            return 0;
          }
        });
        return users;
      }),
    );
  }

  cleanup(cId: string) {
    this.slRx.release(cId);
  }
}
