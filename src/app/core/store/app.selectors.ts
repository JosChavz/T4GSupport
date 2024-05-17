import { Injectable } from '@angular/core';
import { CachedSelectorsService } from './cached-selectors.service';

import { AuthSelectorsService } from './auth/auth.selectors';

// Entity Selectors
import { AppStateService } from './app-state/app-state.service';
import { UserContextService } from './user-context/user-context.service';
import { UserService } from './user/user.service';

@Injectable({
  providedIn: 'root',
})
export class EntitySelectorService {
  constructor(
    private cachedSelectors: CachedSelectorsService,
    private auth: AuthSelectorsService,
    // Entity Selectors
    private appState: AppStateService,
    private userContext: UserContextService,
    private user: UserService,
  ) { }

  public createId = this.cachedSelectors.createId;
  public release = this.cachedSelectors.release;

  public selectAuthUser = this.auth.selectAuthUser;

  // Entity Selectors
  public getAppState = this.appState.getAppState;
  public getAppStates = this.appState.getAppStates;
  public selectAppState = this.appState.selectAppState;
  public selectAppStates = this.appState.selectAppStates;
  public getUserContext = this.userContext.getUserContext;
  public getUserContexts = this.userContext.getUserContexts;
  public selectUserContext = this.userContext.selectUserContext;
  public selectUserContexts = this.userContext.selectUserContexts;
  public selectUser = this.user.selectUser;
  public selectUsers = this.user.selectUsers;
  public getUser = this.user.getUser;
  public getUsers = this.user.getUsers;
}
