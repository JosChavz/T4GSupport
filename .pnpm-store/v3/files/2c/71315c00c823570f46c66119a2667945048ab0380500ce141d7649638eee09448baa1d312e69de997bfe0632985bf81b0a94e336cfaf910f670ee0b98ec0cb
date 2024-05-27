import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { AppState } from './app-state.model';
import { AppStateActions, AppStateActionTypes } from './app-state.actions';
import { createFeatureSelector } from '@ngrx/store';

export interface State extends EntityState<AppState> {
  // additional entities state properties
}

export const adapter: EntityAdapter<AppState> = createEntityAdapter<AppState>({
  selectId: (appState: AppState) => appState.__id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state: State = initialState,
  action: AppStateActions,
) {
  switch (action.type) {
    case AppStateActionTypes.ADDED:
      return adapter.upsertOne(action.payload, state);

    case AppStateActionTypes.LOADED:
      return adapter.upsertMany(action.payload, state);

    case AppStateActionTypes.MODIFIED:
      return adapter.updateOne({
        id: action.payload.__id,
        changes: action.payload,
      }, state);

    case AppStateActionTypes.REMOVED:
      return adapter.removeOne(action.payload.__id, state);

    default:
      return state;
  }
}

export const getAppStateState = createFeatureSelector<State>('appState');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(getAppStateState);
