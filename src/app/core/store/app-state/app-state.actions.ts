import { Action } from '@ngrx/store';
import { LoadAction } from '../app.actions';
import { AppState } from './app-state.model';

export enum AppStateActionTypes {
  STREAM = '[AppState] stream appState',
  STREAM_SUCCESS = '[AppState] stream appState success',
  STREAM_FAIL = '[AppState] stream appState fail',
  LOAD = '[AppState] load appState',
  LOAD_SUCCESS = '[AppState] load appState success',
  LOAD_FAIL = '[AppState] load appState fail',
  ADD = '[AppState] add appState',
  ADD_SUCCESS = '[AppState] add appState success',
  ADD_FAIL = '[AppState] add appState fail',
  UPDATE = '[AppState] update appState',
  UPDATE_SUCCESS = '[AppState] update appState success',
  UPDATE_FAIL = '[AppState] update appState fail',
  REMOVE = '[AppState] remove appState',
  REMOVE_SUCCESS = '[AppState] remove appState success',
  REMOVE_FAIL = '[AppState] remove appState fail',
  LOADED = '[AppState] loaded',
  ADDED = '[AppState] added',
  MODIFIED = '[AppState] modified',
  REMOVED = '[AppState] removed',
}

// See Firebase Docs for current constraints on valid queries
export class StreamAppState implements Action {
  readonly type = AppStateActionTypes.STREAM;
  constructor(
    // property, comparator, value
    public queryParams: [string, string, any][],
    public queryOptions: {
      orderBy?: string | [string, string],
      limit?: number,
      startAt?: string,
      startAfter?: string,
      endAt?: string,
      endBefore?: string,
    },
    public correlationId: string,
    public followupActions?: (appState: AppState) => LoadAction[],
  ) {}
}

export class StreamAppStateSuccess implements Action {
  readonly type = AppStateActionTypes.STREAM_SUCCESS;
  constructor(
    public queryParams: [string, string, any][],
    public queryOptions: {
      orderBy?: string | [string, string],
      limit?: number,
      startAt?: string,
      startAfter?: string,
      endAt?: string,
      endBefore?: string,
    },
    public correlationId: string,
    public followupActions?: (appState: AppState) => LoadAction[],
  ) {}
}

export class StreamAppStateFail implements Action {
  readonly type = AppStateActionTypes.STREAM_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}


export class LoadAppState implements Action {
  readonly type = AppStateActionTypes.LOAD;
  constructor(
    // property, comparator, value
    public queryParams: [string, string, any][],
    public queryOptions: {
      orderBy?: string | [string, string],
      limit?: number,
      startAt?: string,
      startAfter?: string,
      endAt?: string,
      endBefore?: string,
    },
    public correlationId: string,
    public followupActions?: (appState: AppState) => LoadAction[],
  ) {}
}

export class LoadAppStateSuccess implements Action {
  readonly type = AppStateActionTypes.LOAD_SUCCESS;
  constructor(
    public queryParams: [string, string, any][],
    public queryOptions: {
      orderBy?: string | [string, string],
      limit?: number,
      startAt?: string,
      startAfter?: string,
      endAt?: string,
      endBefore?: string,
    },
    public correlationId: string,
    public followupActions?: (appState: AppState) => LoadAction[],
  ) {}
}

export class LoadAppStateFail implements Action {
  readonly type = AppStateActionTypes.LOAD_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class AddAppState implements Action {
  readonly type = AppStateActionTypes.ADD;
  constructor(
    public appState: AppState,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class AddAppStateSuccess implements Action {
  readonly type = AppStateActionTypes.ADD_SUCCESS;
  constructor(
    public appState: AppState,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class AddAppStateFail implements Action {
  readonly type = AppStateActionTypes.ADD_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class UpdateAppState implements Action {
  readonly type = AppStateActionTypes.UPDATE;
  constructor(
    public __id: string,
    public changes: Partial<AppState>,
    public correlationId?: string,
  ) { }
}

export class UpdateAppStateSuccess implements Action {
  readonly type = AppStateActionTypes.UPDATE_SUCCESS;
  constructor(
    public __id: string,
    public changes: Partial<AppState>,
    public correlationId?: string,
  ) {}
}

export class UpdateAppStateFail implements Action {
  readonly type = AppStateActionTypes.UPDATE_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class RemoveAppState implements Action {
  readonly type = AppStateActionTypes.REMOVE;
  constructor(
    public __id: string,
    public correlationId?: string,
  ) { }
}

export class RemoveAppStateSuccess implements Action {
  readonly type = AppStateActionTypes.REMOVE_SUCCESS;
  constructor(
    public __id: string,
    public correlationId?: string,
  ) {}
}

export class RemoveAppStateFail implements Action {
  readonly type = AppStateActionTypes.REMOVE_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class LoadedAppState implements Action {
  readonly type = AppStateActionTypes.LOADED;
  constructor(
    public payload: AppState[],
    public correlationId?: string,
  ) {}
}

export class AddedAppState implements Action {
  readonly type = AppStateActionTypes.ADDED;
  constructor(
    public payload: AppState,
    public correlationId?: string,
  ) {}
}

export class ModifiedAppState implements Action {
  readonly type = AppStateActionTypes.MODIFIED;
  constructor(
    public payload: AppState,
    public correlationId?: string,
  ) {}
}

export class RemovedAppState implements Action {
  readonly type = AppStateActionTypes.REMOVED;
  constructor(
    public payload: AppState,
    public correlationId?: string,
  ) {}
}

export type AppStateActions =
  StreamAppState |
  StreamAppStateSuccess |
  StreamAppStateFail |
  LoadAppState |
  LoadAppStateSuccess |
  LoadAppStateFail |
  AddAppState |
  AddAppStateSuccess |
  AddAppStateFail |
  UpdateAppState |
  UpdateAppStateSuccess |
  UpdateAppStateFail |
  RemoveAppState |
  RemoveAppStateSuccess |
  RemoveAppStateFail |
  LoadedAppState |
  AddedAppState |
  ModifiedAppState |
  RemovedAppState;
