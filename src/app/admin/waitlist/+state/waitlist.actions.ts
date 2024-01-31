import { Action } from '@ngrx/store';

export enum WaitlistActionTypes {
  LOAD_DATA = '[Waitlist] load data',
  CLEANUP = '[Waitlist] cleanup',
}

/** Action for loading required DB data. */
export class LoadData implements Action {
  readonly type = WaitlistActionTypes.LOAD_DATA;

  constructor(public containerId: string) { }
}

/** Action for cleaning up loading subscriptions. */
export class Cleanup implements Action {
  readonly type = WaitlistActionTypes.CLEANUP;
  constructor(public containerId: string) { }
}

export type WaitlistActions =
  LoadData |
  Cleanup;
