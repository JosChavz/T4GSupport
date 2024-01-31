import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of, Observable, throwError, forkJoin, from, pipe, merge } from 'rxjs';
import { switchMap, flatMap, mergeMap, map, catchError, tap, take } from 'rxjs/operators';
import { FirebaseService } from '../../firebase/firebase.service';
import { CachedLoadConnectionsService } from '../cached-load-connections.service';

import { UserContext } from './user-context.model';
import { UserContextActionTypes, UserContextActions,
  AddedUserContext, RemovedUserContext,
  StreamUserContext, StreamUserContextSuccess, StreamUserContextFail,
  LoadUserContext, LoadUserContextSuccess, LoadUserContextFail,
  AddUserContext, AddUserContextSuccess, AddUserContextFail,
  UpdateUserContext, UpdateUserContextSuccess, UpdateUserContextFail,
  RemoveUserContext, RemoveUserContextSuccess, RemoveUserContextFail } from './user-context.actions';

@Injectable()
export class UserContextEffects {
  /** Process the stream action to create firebase connections. */
  stream$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<StreamUserContext>(UserContextActionTypes.STREAM),
      mergeMap((action: StreamUserContext) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new StreamUserContextSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new StreamUserContextFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the load action to create firebase connections. */
  load$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadUserContext>(UserContextActionTypes.LOAD),
      mergeMap((action: LoadUserContext) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new LoadUserContextSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new LoadUserContextFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the add action to update database and initiate callbacks. */
  add$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<AddUserContext>(UserContextActionTypes.ADD),
      mergeMap((action: AddUserContext) => {
        if (action.options && action.options.optimistic) {
          return merge(
            of(new AddedUserContext(action.userContext, action.correlationId)),
            this.db.addEntity('userContexts', action.userContext).pipe(
              mergeMap(() => merge(
                of(new AddUserContextSuccess(action.userContext, action.correlationId)),
                this.actionsOnAdd(action),
              )),
              catchError((error) => merge(
                of(new AddUserContextFail(error, action.correlationId)),
                of(new RemovedUserContext(action.userContext, action.correlationId)),
              )),
            ),
          );
        } else {
          return this.db.addEntity('userContexts', action.userContext).pipe(
            mergeMap(() => merge(
              of(new AddUserContextSuccess(action.userContext, action.correlationId)),
              this.actionsOnAdd(action),
            )),
            catchError((error) => of(new AddUserContextFail(error, action.correlationId))),
          );
        }
      }),
    ),
  );

  /** Process the update action to update database and initiate callbacks. */
  update$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<UpdateUserContext>(UserContextActionTypes.UPDATE),
      mergeMap((action: UpdateUserContext) => {
        return this.db.updateEntity('userContexts', action.__id, action.changes).pipe(
          mergeMap(() => merge(
            of(new UpdateUserContextSuccess(action.__id, action.changes, action.correlationId)),
            this.actionsOnUpdate(action),
          )),
          catchError((error) => of(new UpdateUserContextFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the remove action to update database and initiate callbacks. */
  remove$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<RemoveUserContext>(UserContextActionTypes.REMOVE),
      mergeMap((action: RemoveUserContext) => {
        return this.db.removeEntity('userContexts', action.__id).pipe(
          mergeMap(() => merge(
            of(new RemoveUserContextSuccess(action.__id, action.correlationId)),
            this.actionsOnRemove(action),
          )),
          catchError((error) => of(new RemoveUserContextFail(error, action.correlationId))),
        );
      }),
    ),
  );

  actionsOnAdd(action: AddUserContext): Observable<Action> {
    return EMPTY;
  }

  actionsOnUpdate(action: UpdateUserContext): Observable<Action> {
    return EMPTY;
  }

  actionsOnRemove(action: RemoveUserContext): Observable<Action> {
    return EMPTY;
  }

  constructor(
    private actions$: Actions,
    private db: FirebaseService,
    private clc: CachedLoadConnectionsService,
  ) {}
}
