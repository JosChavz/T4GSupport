import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { LocalStorageService } from './local-storage.service';

// The reason why we need these is to hold independent data for each tab.
// The set/get/removeItemForSession is used when working with the same tab (typically),
// whereas, the get/remove for all sessions allows one to look at what keys might have
// been stored in past tabs
@Injectable({
  providedIn: 'root',
})
export class SessionLocalStorageService {
  constructor(
    private session: SessionService,
    private local: LocalStorageService,
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setItemForSession(key: string, data: any, sessionId?: string): void {
    let keyWithSession;
    if (sessionId) {
      keyWithSession = `${key}__${sessionId}`;
    } else {
      keyWithSession = `${key}__${this.session.getSessionId()}`;
    }

    this.local.setItem(keyWithSession, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getItemForSession(key: string, sessionId?: string): any {
    let keyWithSession;
    if (sessionId) {
      keyWithSession = `${key}__${sessionId}`;
    } else {
      keyWithSession = `${key}__${this.session.getSessionId()}`;
    }

    return this.local.getItem(keyWithSession);
  }

  public removeItemForSession(key: string, sessionId?: string): void {
    let keyWithSession;
    if (sessionId) {
      keyWithSession = `${key}__${sessionId}`;
    } else {
      keyWithSession = `${key}__${this.session.getSessionId()}`;
    }

    this.local.removeItem(keyWithSession);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getItemForAllSessions(key: string): any[] {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(`${key}__`))
      .map((k) => this.local.getItem(k));
  }

  public removeItemForAllSessions(key: string): void {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(`${key}__`)) {
        this.local.removeItem(k);
      }
    }
  }
}
