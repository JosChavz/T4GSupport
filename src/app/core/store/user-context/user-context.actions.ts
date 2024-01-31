import { Action } from '@ngrx/store';
import { LoadAction } from '../app.actions';
import { UserContext } from './user-context.model';

export enum UserContextActionTypes {
  STREAM = '[UserContext] stream userContext',
  STREAM_SUCCESS = '[UserContext] stream userContext success',
  STREAM_FAIL = '[UserContext] stream userContext fail',
  LOAD = '[UserContext] load userContext',
  LOAD_SUCCESS = '[UserContext] load userContext success',
  LOAD_FAIL = '[UserContext] load userContext fail',
  ADD = '[UserContext] add userContext',
  ADD_SUCCESS = '[UserContext] add userContext success',
  ADD_FAIL = '[UserContext] add userContext fail',
  UPDATE = '[UserContext] update userContext',
  UPDATE_SUCCESS = '[UserContext] update userContext success',
  UPDATE_FAIL = '[UserContext] update userContext fail',
  REMOVE = '[UserContext] remove userContext',
  REMOVE_SUCCESS = '[UserContext] remove userContext success',
  REMOVE_FAIL = '[UserContext] remove userContext fail',
  LOADED = '[UserContext] loaded',
  ADDED = '[UserContext] added',
  MODIFIED = '[UserContext] modified',
  REMOVED = '[UserContext] removed',
}

// See Firebase Docs for current constraints on valid queries
export class StreamUserContext implements Action {
  readonly type = UserContextActionTypes.STREAM;
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
    public followupActions?: (userContext: UserContext) => LoadAction[],
  ) {}
}

export class StreamUserContextSuccess implements Action {
  readonly type = UserContextActionTypes.STREAM_SUCCESS;
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
    public followupActions?: (userContext: UserContext) => LoadAction[],
  ) {}
}

export class StreamUserContextFail implements Action {
  readonly type = UserContextActionTypes.STREAM_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class LoadUserContext implements Action {
  readonly type = UserContextActionTypes.LOAD;
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
    public followupActions?: (userContext: UserContext) => LoadAction[],
  ) {}
}

export class LoadUserContextSuccess implements Action {
  readonly type = UserContextActionTypes.LOAD_SUCCESS;
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
    public followupActions?: (userContext: UserContext) => LoadAction[],
  ) {}
}

export class LoadUserContextFail implements Action {
  readonly type = UserContextActionTypes.LOAD_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class AddUserContext implements Action {
  readonly type = UserContextActionTypes.ADD;
  constructor(
    public userContext: UserContext,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class AddUserContextSuccess implements Action {
  readonly type = UserContextActionTypes.ADD_SUCCESS;
  constructor(
    public userContext: UserContext,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class AddUserContextFail implements Action {
  readonly type = UserContextActionTypes.ADD_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
    public options?: {
      optimistic?: boolean,
    },
  ) {}
}

export class UpdateUserContext implements Action {
  readonly type = UserContextActionTypes.UPDATE;
  constructor(
    public __id: string,
    public changes: Partial<UserContext>,
    public correlationId?: string,
  ) { }
}

export class UpdateUserContextSuccess implements Action {
  readonly type = UserContextActionTypes.UPDATE_SUCCESS;
  constructor(
    public __id: string,
    public changes: Partial<UserContext>,
    public correlationId?: string,
  ) {}
}

export class UpdateUserContextFail implements Action {
  readonly type = UserContextActionTypes.UPDATE_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class RemoveUserContext implements Action {
  readonly type = UserContextActionTypes.REMOVE;
  constructor(
    public __id: string,
    public correlationId?: string,
  ) { }
}

export class RemoveUserContextSuccess implements Action {
  readonly type = UserContextActionTypes.REMOVE_SUCCESS;
  constructor(
    public __id: string,
    public correlationId?: string,
  ) {}
}

export class RemoveUserContextFail implements Action {
  readonly type = UserContextActionTypes.REMOVE_FAIL;
  constructor(
    public error: any,
    public correlationId?: string,
  ) {}
}

export class LoadedUserContext implements Action {
  readonly type = UserContextActionTypes.LOADED;
  constructor(
    public payload: UserContext[],
    public correlationId?: string,
  ) {}
}

export class AddedUserContext implements Action {
  readonly type = UserContextActionTypes.ADDED;
  constructor(
    public payload: UserContext,
    public correlationId?: string,
  ) {}
}

export class ModifiedUserContext implements Action {
  readonly type = UserContextActionTypes.MODIFIED;
  constructor(
    public payload: UserContext,
    public correlationId?: string,
  ) {}
}

export class RemovedUserContext implements Action {
  readonly type = UserContextActionTypes.REMOVED;
  constructor(
    public payload: UserContext,
    public correlationId?: string,
  ) {}
}

export type UserContextActions =
  StreamUserContext |
  StreamUserContextSuccess |
  StreamUserContextFail |
  LoadUserContext |
  LoadUserContextSuccess |
  LoadUserContextFail |
  AddUserContext |
  AddUserContextSuccess |
  AddUserContextFail |
  UpdateUserContext |
  UpdateUserContextSuccess |
  UpdateUserContextFail |
  RemoveUserContext |
  RemoveUserContextSuccess |
  RemoveUserContextFail |
  LoadedUserContext |
  AddedUserContext |
  ModifiedUserContext |
  RemovedUserContext;
