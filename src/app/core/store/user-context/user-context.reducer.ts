import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { UserContext } from './user-context.model';
import { UserContextActions, UserContextActionTypes } from './user-context.actions';
import { createFeatureSelector } from '@ngrx/store';

export interface State extends EntityState<UserContext> {
  // additional entities state properties
}

export const adapter: EntityAdapter<UserContext> = createEntityAdapter<UserContext>({
  selectId: (userContext: UserContext) => userContext.__id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state: State = initialState,
  action: UserContextActions,
) {
  switch (action.type) {
    case UserContextActionTypes.ADDED:
      return adapter.upsertOne(action.payload, state);

    case UserContextActionTypes.LOADED:
      return adapter.upsertMany(action.payload, state);

    case UserContextActionTypes.MODIFIED:
      return adapter.updateOne({
        id: action.payload.__id,
        changes: action.payload,
      }, state);

    case UserContextActionTypes.REMOVED:
      return adapter.removeOne(action.payload.__id, state);

    default:
      return state;
  }
}

export const getUserContextState = createFeatureSelector<State>('userContext');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(getUserContextState);
