import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as fromStore from '../app.reducer';
import * as fromAuth from './auth.reducer';
import { FirebaseService } from '../../firebase/firebase.service';
import { ActionFlow, RouterNavigate } from '../app.actions';
import * as firebase from 'firebase/compat/app';

import { switchMap, mergeMap, map, catchError, tap, take, pluck } from 'rxjs/operators';
import { LOAD, LOGIN, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL, Login, LoginSuccess, LoginFail, Logout, LogoutSuccess, LogoutFail, LoadAuth, LoadedAuth } from './auth.actions';
import { User, AccessState } from '../user/user.model';
import { UserActionTypes, AddUser, UpdateUser } from '../user/user.actions';

@Injectable()
export class AuthEffects {
  /** Process the logout action. */
  Logout$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType(LOGOUT),
      mergeMap((action: Logout) => {
        return this.db.logout().pipe(
          mergeMap(() => [
            ...(action.payload.doNotRoute ? [] : [
              // Change this to where you want to navigate to after logout
              new RouterNavigate(['/landing']),
            ]),
            new LogoutSuccess(action.correlationId),
          ]),
          catchError((error) => of(new LogoutFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the load auth action. */
  LoadAuth$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoadAuth>(LOAD),
      switchMap(() => this.db.afUser()),
      switchMap((afUser: any) => {
        if (afUser) {
          // Note that using this.db.queryObjValueChanges doesn't work since it first returns
          // undefined from the cache which messes up the logic (results in it doing a Logout)
          return this.db.queryListValueChanges<User>('users', [['__id', '==', afUser.uid]]).pipe(
            map((users: User[]) => {
              if (users && users.length > 0) {
                return new LoadedAuth({ user: users[0] });
              } else {
                // This should not happen. If there is no entry in DB despite
                // having a FireAuth user, make them login again to create an entry
                return new Logout({ doNotRoute: true });
              }
            }),
          );
        } else {
          return [new LoadedAuth({ user: undefined })];
        }
      }),
    ),
  );

  /** Process the login action. */
  Login$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<Login>(LOGIN),
      switchMap((action) => {
        return this.db.login(action.payload.provider, action.payload.scope).pipe(
          map((results) => {
            const afUser = results.user;
            const dbUser = results.dbUser;

            let userActionSet;

            const userParams = {
              email: afUser.email,
              name: afUser.displayName || afUser.email,
              photoURL: afUser.photoURL,
            };

            if (dbUser) {
              // update user
              userActionSet = {
                action: new UpdateUser(dbUser.__id, Object.assign({}, userParams, {
                  tokens: Object.assign({}, dbUser.tokens || {}, this.getToken(results.credential)),
                })),
                responseActionTypes: {
                  success: UserActionTypes.UPDATE_SUCCESS,
                  failure: UserActionTypes.UPDATE_FAIL,
                },
              };
            } else {
              // add user
              userActionSet = {
                action: new AddUser(Object.assign({}, userParams, {
                  __id: afUser.uid,
                  tokens: this.getToken(results.credential),
                  isAdmin: false,
                  consented: false,
                  accessState: AccessState.CONSENT,
                })),
                responseActionTypes: {
                  success: UserActionTypes.ADD_SUCCESS,
                  failure: UserActionTypes.ADD_FAIL,
                },
              };
            }

            return new ActionFlow({
              actionSets: [userActionSet],
              successActionFn: (actionSetResponses) => {
                return [
                  // Don't route if there is a doNotRoute parameter passed in
                  ...(action.payload.doNotRoute ? [] : [
                    // Change this to where you want to navigate to after login
                    new RouterNavigate(
                      ['/home'],
                      { queryParamsHandling: 'preserve' },
                    ),
                  ]),
                  new LoginSuccess({ ...action.payload, ...results }, action.correlationId),
                ];
              },
            });
          }),
          catchError((error) => of(new LoginFail(error, action.correlationId))),
        );
      }),
    ),
  );

  /** Process the login fail action. */
  loginFail$: Observable<Action> = createEffect(
    () => this.actions$.pipe(
      ofType<LoginFail>(LOGIN_FAIL),
      tap((action: LoginFail) => {
        switch (action.error.code) {
          case 'auth/account-exists-with-different-credential': {
            this.db.loginLink(action.error);
          }
        }
      }),
    ),
    { dispatch: false },
  );

  getToken(credential) {
    const tokenHash = {};
    tokenHash[credential.providerId] = credential.accessToken;

    return tokenHash;
  }

  constructor(
    private actions$: Actions,
    private store: Store<fromStore.State>,
    private router: Router,
    private db: FirebaseService,
  ) {}
}
