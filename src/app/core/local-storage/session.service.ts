import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { LoggingAngularFirestore } from '../setup/firebase-setup';

/**
 * Create a sessionId and deviceId for the user. The sessionId should be stored
 * in sessionStorage and the deviceId in localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  /** Keys for localStorage/sessionStorage */
  private SESSION_ID_KEY = 'sessionId';
  private DEVICE_ID_KEY = 'deviceId';

  /** The actual sessionId/deviceId */
  private sessionId;
  private deviceId;

  constructor(
    private local: LocalStorageService,
    private log: LoggingAngularFirestore,
  ) {
    // Get sessionId from sessionStorage. If does not exist, create one
    this.sessionId = sessionStorage.getItem(this.SESSION_ID_KEY);
    if (!this.sessionId) {
      this.sessionId = this.log.createId();
      sessionStorage.setItem(this.SESSION_ID_KEY, this.sessionId);
    }
    // console.log('SESSION_ID', this.sessionId);

    this.deviceId = this.local.getItem(this.DEVICE_ID_KEY);
    if (!this.deviceId) {
      this.deviceId = this.log.createId();
      this.local.setItem(this.DEVICE_ID_KEY, this.deviceId);
    }
    // console.log('DEVICE_ID', this.deviceId);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }
}
