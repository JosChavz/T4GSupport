import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of, Observable, throwError, forkJoin, from, pipe, merge } from 'rxjs';
import { switchMap, flatMap, mergeMap, map, catchError, tap, take } from 'rxjs/operators';
import { FirebaseService } from '../../firebase/firebase.service';
import { CachedLoadConnectionsService } from '../cached-load-connections.service';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../store/app.reducer';
import * as fromAuth from '../../store/auth/auth.reducer';
import { UpdateAppState } from '../../store/app-state/app-state.actions';

import { User, AccessState } from './user.model';
import { UserActionTypes, UserActions,
  AddedUser, RemovedUser,
  StreamUser, StreamUserSuccess, StreamUserFail,
  LoadUser, LoadUserSuccess, LoadUserFail,
  AddUser, AddUserSuccess, AddUserFail,
  UpdateUser, UpdateUserSuccess, UpdateUserFail,
  RemoveUser, RemoveUserSuccess, RemoveUserFail } from './user.actions';

@Injectable()
export class UserEffects {
  /** Process the stream action to create firebase connections. */
  stream$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<StreamUser>(UserActionTypes.STREAM),
      mergeMap((action: StreamUser) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new StreamUserSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new StreamUserFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the load action to create firebase connections. */
  load$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadUser>(UserActionTypes.LOAD),
      mergeMap((action: LoadUser) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new LoadUserSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new LoadUserFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the add action to update database and initiate callbacks. */
  add$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<AddUser>(UserActionTypes.ADD),
      mergeMap((action: AddUser) => {
        if (action.options && action.options.optimistic) {
          return merge(
            of(new AddedUser(action.user, action.correlationId)),
            this.db.addEntity('users', action.user).pipe(
              mergeMap(() => merge(
                of(new AddUserSuccess(action.user, action.correlationId)),
                this.actionsOnAdd(action),
              )),
              catchError((error) => merge(
                of(new AddUserFail(error, action.correlationId)),
                of(new RemovedUser(action.user, action.correlationId)),
              )),
            ),
          );
        } else {
          return this.db.addEntity('users', action.user).pipe(
            mergeMap(() => merge(
              of(new AddUserSuccess(action.user, action.correlationId)),
              this.actionsOnAdd(action),
            )),
            catchError((error) => of(new AddUserFail(error, action.correlationId))),
          );
        }
      }),
    ),
  );

  /** Process the update action to update database and initiate callbacks. */
  update$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<UpdateUser>(UserActionTypes.UPDATE),
      mergeMap((action: UpdateUser) => {
        return this.db.updateEntity('users', action.__id, action.changes).pipe(
          mergeMap(() => merge(
            of(new UpdateUserSuccess(action.__id, action.changes, action.correlationId)),
            this.actionsOnUpdate(action),
          )),
          catchError((error) => of(new UpdateUserFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the remove action to update database and initiate callbacks. */
  remove$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<RemoveUser>(UserActionTypes.REMOVE),
      mergeMap((action: RemoveUser) => {
        return this.db.removeEntity('users', action.__id).pipe(
          mergeMap(() => merge(
            of(new RemoveUserSuccess(action.__id, action.correlationId)),
            this.actionsOnRemove(action),
          )),
          catchError((error) => of(new RemoveUserFail(error, action.correlationId))),
        );
      }),
    ),
  );

  actionsOnAdd(action: AddUser): Observable<Action> {
    return EMPTY;
  }

  actionsOnUpdate(action: UpdateUser): Observable<Action> {
    if (Object.prototype.hasOwnProperty.call(action.changes, 'accessState')) {
      // TODO: inefficient since we're querying all users. replace with count query
      // once added to library
      return this.db.queryListOnce('users', [['accessState', '==', AccessState.WAITING]]).pipe(
        mergeMap((users: User[]) => {
          return [new UpdateAppState('app', {
            _totalWaiting: users.length,
          }, action.correlationId)];
        }),
      );
    } else {
      return EMPTY;
    }
  }

  actionsOnRemove(action: RemoveUser): Observable<Action> {
    return EMPTY;
  }

  constructor(
    private store: Store<fromStore.State>,
    private actions$: Actions,
    private db: FirebaseService,
    private clc: CachedLoadConnectionsService,
  ) {}
}
