import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of, Observable, throwError, forkJoin, from, pipe, merge } from 'rxjs';
import { switchMap, flatMap, mergeMap, map, catchError, tap, take } from 'rxjs/operators';
import { FirebaseService } from '../../firebase/firebase.service';
import { CachedLoadConnectionsService } from '../cached-load-connections.service';

import { AppState } from './app-state.model';
import { AppStateActionTypes, AppStateActions,
  AddedAppState, RemovedAppState,
  StreamAppState, StreamAppStateSuccess, StreamAppStateFail,
  LoadAppState, LoadAppStateSuccess, LoadAppStateFail,
  AddAppState, AddAppStateSuccess, AddAppStateFail,
  UpdateAppState, UpdateAppStateSuccess, UpdateAppStateFail,
  RemoveAppState, RemoveAppStateSuccess, RemoveAppStateFail } from './app-state.actions';

@Injectable()
export class AppStateEffects {
  /** Process the stream action to create firebase connections. */
  stream$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<StreamAppState>(AppStateActionTypes.STREAM),
      mergeMap((action: StreamAppState) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new StreamAppStateSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new StreamAppStateFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the load action to create firebase connections. */
  load$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadAppState>(AppStateActionTypes.LOAD),
      mergeMap((action: LoadAppState) => {
        const connection = this.clc.processLoadAction(action);
        return connection.loadStream.pipe(
          take(1),
          map(() => new LoadAppStateSuccess(action.queryParams, action.queryOptions, action.correlationId, action.followupActions)),
          catchError((error) => of(new LoadAppStateFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the add action to update database and initiate callbacks. */
  add$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<AddAppState>(AppStateActionTypes.ADD),
      mergeMap((action: AddAppState) => {
        if (action.options && action.options.optimistic) {
          return merge(
            of(new AddedAppState(action.appState, action.correlationId)),
            this.db.addEntity('appStates', action.appState).pipe(
              mergeMap(() => merge(
                of(new AddAppStateSuccess(action.appState, action.correlationId)),
                this.actionsOnAdd(action),
              )),
              catchError((error) => merge(
                of(new AddAppStateFail(error, action.correlationId)),
                of(new RemovedAppState(action.appState, action.correlationId)),
              )),
            ),
          );
        } else {
          return this.db.addEntity('appStates', action.appState).pipe(
            mergeMap(() => merge(
              of(new AddAppStateSuccess(action.appState, action.correlationId)),
              this.actionsOnAdd(action),
            )),
            catchError((error) => of(new AddAppStateFail(error, action.correlationId))),
          );
        }
      }),
    ),
  );

  /** Process the update action to update database and initiate callbacks. */
  update$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<UpdateAppState>(AppStateActionTypes.UPDATE),
      mergeMap((action: UpdateAppState) => {
        return this.db.updateEntity('appStates', action.__id, action.changes).pipe(
          mergeMap(() => merge(
            of(new UpdateAppStateSuccess(action.__id, action.changes, action.correlationId)),
            this.actionsOnUpdate(action),
          )),
          catchError((error) => of(new UpdateAppStateFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the remove action to update database and initiate callbacks. */
  remove$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<RemoveAppState>(AppStateActionTypes.REMOVE),
      mergeMap((action: RemoveAppState) => {
        return this.db.removeEntity('appStates', action.__id).pipe(
          mergeMap(() => merge(
            of(new RemoveAppStateSuccess(action.__id, action.correlationId)),
            this.actionsOnRemove(action),
          )),
          catchError((error) => of(new RemoveAppStateFail(error, action.correlationId))),
        );
      }),
    ),
  );

  actionsOnAdd(action: AddAppState): Observable<Action> {
    return EMPTY;
  }

  actionsOnUpdate(action: UpdateAppState): Observable<Action> {
    return EMPTY;
  }

  actionsOnRemove(action: RemoveAppState): Observable<Action> {
    return EMPTY;
  }

  constructor(
    private actions$: Actions,
    private db: FirebaseService,
    private clc: CachedLoadConnectionsService,
  ) {}
}
