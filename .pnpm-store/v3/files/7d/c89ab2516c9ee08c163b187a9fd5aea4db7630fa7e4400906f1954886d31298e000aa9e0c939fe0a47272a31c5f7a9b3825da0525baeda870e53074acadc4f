import { Action } from '@ngrx/store';
import { User } from '../../../core/store/user/user.model';

export enum WaitingActionTypes {
  LOAD_DATA = '[Waiting] load data',
  CLEANUP = '[Waiting] cleanup',
}

/** Action for loading required DB data. */
export class LoadData implements Action {
  readonly type = WaitingActionTypes.LOAD_DATA;

  constructor(public payload: {
    currentUser: User,
  }, public correlationId: string) { }
}

/** Action for cleaning up loading subscriptions. */
export class Cleanup implements Action {
  readonly type = WaitingActionTypes.CLEANUP;
  constructor(public correlationId: string) { }
}

export type WaitingActions =
  LoadData |
  Cleanup;
