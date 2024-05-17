import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';

import * as fromAuth from './auth/auth.reducer';

// Entity Reducers
import * as fromAppState from './app-state/app-state.reducer';
import * as fromUserContext from './user-context/user-context.reducer';
import * as fromUser from './user/user.reducer';

export interface State {
  auth: fromAuth.State;
  router: RouterReducerState;
  // Entity State
  appState: fromAppState.State;
  userContext: fromUserContext.State;
  user: fromUser.State;
}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  auth: fromAuth.reducer,
  // Entity Reducers
  appState: fromAppState.reducer,
  userContext: fromUserContext.reducer,
  user: fromUser.reducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
