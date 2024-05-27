import { Action } from '@ngrx/store';
import { User } from '../../../core/store/user/user.model';

export enum LandingActionTypes {
  LOAD_DATA = '[Landing] load data',
  CLEANUP = '[Landing] cleanup',
}

/** Action for loading required DB data. */
export class LoadData implements Action {
  readonly type = LandingActionTypes.LOAD_DATA;

  constructor(public payload: {
    currentUser: User,
  }, public correlationId: string) { }
}

/** Action for cleaning up loading subscriptions. */
export class Cleanup implements Action {
  readonly type = LandingActionTypes.CLEANUP;
  constructor(public correlationId: string) { }
}

export type LandingActions =
  LoadData |
  Cleanup;
