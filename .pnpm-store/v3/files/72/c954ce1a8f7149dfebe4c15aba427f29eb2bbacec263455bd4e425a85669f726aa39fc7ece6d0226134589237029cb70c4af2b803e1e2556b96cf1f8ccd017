import { Action } from '@ngrx/store';
import { User } from '../../../core/store/user/user.model';

export enum HomeActionTypes {
  LOAD_DATA = '[Home] load data',
  CLEANUP = '[Home] cleanup',
}

/** Action for loading required DB data. */
export class LoadData implements Action {
  readonly type = HomeActionTypes.LOAD_DATA;

  constructor(public payload: {
    currentUser: User,
  }, public correlationId: string) { }
}

/** Action for cleaning up loading subscriptions. */
export class Cleanup implements Action {
  readonly type = HomeActionTypes.CLEANUP;
  constructor(public correlationId: string) { }
}

export type HomeActions =
  LoadData |
  Cleanup;
