import { Action } from '@ngrx/store';

export enum ConsentActionTypes {
  LOAD_DATA = '[Consent] load data',
  CLEANUP = '[Consent] cleanup',
}

/** Action for loading required DB data. */
export class LoadData implements Action {
  readonly type = ConsentActionTypes.LOAD_DATA;

  constructor(public correlationId: string) { }
}

/** Action for cleaning up loading subscriptions. */
export class Cleanup implements Action {
  readonly type = ConsentActionTypes.CLEANUP;
  constructor(public correlationId: string) { }
}

export type ConsentActions =
  LoadData |
  Cleanup;
