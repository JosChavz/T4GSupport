import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, Observable, ConnectableObservable, fromEvent, merge, combineLatest } from 'rxjs';
import { startWith, withLatestFrom, tap, takeUntil, switchMap, debounceTime, mergeMap, publishReplay, filter, map, pairwise, scan } from 'rxjs/operators';
import { FirebaseService } from '../firebase/firebase.service';
import { LogService } from './log.service';
import { SessionLocalStorageService } from '../local-storage/session-local-storage.service';
import { SessionService } from '../local-storage/session.service';

export interface TimeAtRoute {
  __userId?: string;
  __sessionId: string; // unique for a given session/tab
  __deviceId: string; // unique for the device
  route: string;
  startTime: number;
  time: Array<{ type: string, total: number }>;
}

// We use this typing since Firebase doesn't accept nested arrays
export interface Interaction {
  0: number;
  1: string;
  2: string;
  3: string;
}

/**
 * When the application starts and SessionService is initialized, we:
 * - get the stored sessionId or create one ourselves,
 * - get the stored deviceId or create one ourselves
 *
 * When the application starts and TimeAnalytics is initialized, we:
 * - add an eventlistener for "visibilitychange" to sendBeacon when user leaves
 * - define the event stream (this.eventTimestamps$),
 * - define the route stream (this.currentRoute$),
 * - define a stream to track the active time at each route (this.runningTimeAtRoute$)
 *   by combining the event and route streams, updating the time increment with
 *   each event, and adding in __userId, __sessionId, __deviceId
 *
 * Then when startTimeLogging is called in the app init, we:
 * - first handle any logs in localStorage that never got saved to the DB due to
 *   refresh/close/etc. and clear localStorage
 * - subscribe to this.runningTimeAtRoute$, saving latest to localStorage, then
 *   filtering to only when the route or user changes and when total time is
 *   non-zero to log to the DB. When saving, reset the interactionsAtRoute and
 *   remove interactions from localStorage
 *
 * When registerInteractions is called anywhere in the app, we:
 * - subscribe to the interaction observables passed in
 * - whenever an event comes into one of those observables, we update it within a
 *   local variable as well as in localStorage. The local variable is used when
 *   saving to the DB on route/user changes and the localStorage variable is used
 *   when retrieving and saving prior logs on a new session.
 */
@Injectable({
  providedIn: 'root',
})
export class TimeAnalyticsService {
  /** Local storage keys for storing unsaved log data. */
  private TIME_KEY = 'timeAtRoute';
  private IX_KEY = 'interactionsAtRoute';

  /** Timestamps for all the main user events. */
  private eventTimestamps$: Observable<number>;

  /** The current route a user is visiting. */
  private currentRoute$: ConnectableObservable<string>;

  /** The running update of time analytics for each route. */
  private runningTimeAtRoute$: Observable<TimeAtRoute>;

  /** Events representing different registered interactions. */
  private interactions$: Subject<string> = new Subject<string>();

  /** Interactions data at latest route. */
  private interactionsAtRoute: Interaction[] = null;

  /**
   * Helper function for getting a log id to make sure we don't save two logs
   * of the same session at the same time
   */
  private getLogId(data) {
    return `${data.__sessionId}__${data.startTime}`;
  }

  /** Helper function for saving log to DB given timeAtRoute, interactionsAtRoute. */
  private saveLogToDB(timeAtRoute: TimeAtRoute, interactionsAtRoute: Interaction[]) {
    if (timeAtRoute) {
      if (!interactionsAtRoute) {
        this.log.rawLog(timeAtRoute, 'logs', this.getLogId(timeAtRoute));
      } else {
        this.log.rawLog({
          ...timeAtRoute,
          interactions: interactionsAtRoute,
        }, 'logs', this.getLogId(timeAtRoute));
      }
    }
  }

  /** Function that checks for any prior session logs unsaved to DB, called in startTimeLogging only. */
  private handlePriorSessionLogs() {
    // Check if there are any unsaved logs in localStorage. If so, save to firebase
    // Note that there could be multiple because there could be multiple tabs/windows
    // open on the same browser. Also note that we save and remove ALL of them,
    // including ones that could be currently active. This is ok because it just
    // means we're saving an early version of the log to the DB which will get
    // overwritten later (we can't distinguish between an active session and an
    // inactive one, so we just have to process them all).

    for (const timeAtRoute of this.local.getItemForAllSessions(this.TIME_KEY)) {
      // console.log('GET PRIOR SESSION LOG', timeAtRoute);

      // Safety check that it really is our data
      if (Object.prototype.hasOwnProperty.call(timeAtRoute, '__sessionId') &&
        Object.prototype.hasOwnProperty.call(timeAtRoute, 'route') &&
        Object.prototype.hasOwnProperty.call(timeAtRoute, 'startTime')
      ) {
        const interactionsAtRoute = this.local.getItemForSession(this.IX_KEY, timeAtRoute.__sessionId);
        // console.log('SAVE PRIOR SESSION LOG', timeAtRoute, interactionsAtRoute);
        this.saveLogToDB(timeAtRoute, interactionsAtRoute);
      }
    }

    // Remove old keys from localStorage.
    this.local.removeItemForAllSessions(this.TIME_KEY);
    this.local.removeItemForAllSessions(this.IX_KEY);
  }

  /** Function that is called by the app to start analytics. */
  public startTimeLogging() {
    // console.log('START TIME LOGGING');

    // Handle any unstored logs from prior session
    this.handlePriorSessionLogs();

    // Filters down to only the times when we need to record, i.e. when route or user changes and when total time is non-zero, log to DB, and reset interactions array
    this.runningTimeAtRoute$.pipe(
      pairwise(),
      // Save the latest timeAtRoute to localStorage in case we're interrupted
      tap(([timeAtRoute1, timeAtRoute2]) => {
        // console.log('SET SESSION LOG', timeAtRoute2);
        this.local.setItemForSession(this.TIME_KEY, timeAtRoute2);
      }),
      filter(([timeAtRoute1, timeAtRoute2]) => {
        return timeAtRoute2.route !== timeAtRoute1.route || timeAtRoute2.__userId !== timeAtRoute1.__userId;
      }),
      filter(([timeAtRoute1, timeAtRoute2]) => {
        const total = timeAtRoute1.time.reduce((x, y) => {
          return x + y.total;
        }, 0);
        return total > 0;
      }),
    ).subscribe(([timeAtRoute1, timeAtRoute2]) => {
      // Log the completed log (currently only for logged in users)
      // console.log('SAVE LOG TO DB', timeAtRoute1, this.interactionsAtRoute);
      this.saveLogToDB(timeAtRoute1, this.interactionsAtRoute);

      // Reset the interactions. Note we do null rather than empty array
      // so that we don't add that field when there are no interactions
      this.interactionsAtRoute = null;
      this.local.removeItemForSession(this.IX_KEY);
    });
  }

  /** Function that can be called by a container to register interactions. */
  public registerInteractions(
    interactions: Array<{ 0: string, 1: string, 2: Observable<any> }>,
    unsubscribe$: Subject<void>,
  ) {
    for (const ix of interactions) {
      // Subscribe to each interaction until unsubscribe, and register that the event occured
      // console.log('REGISTER INTERACTION', `${ix[0]}-${ix[1]}`);
      ix[2].pipe(
        takeUntil(unsubscribe$),
      ).subscribe((data) => {
        let ixLog = { 0: null, 1: null, 2: null, 3: null };
        if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
          ixLog = { 0: Date.now(), 1: String(ix[0]), 2: String(ix[1]), 3: String(data) };
        } else {
          ixLog = { 0: Date.now(), 1: String(ix[0]), 2: String(ix[1]), 3: null };
        }
        if (!this.interactionsAtRoute) {
          const newInteractions: Array<{ 0: number, 1: string, 2: string, 3: string }> = [ixLog];
          this.interactionsAtRoute = newInteractions;
          this.local.setItemForSession(this.IX_KEY, this.interactionsAtRoute);
          // console.log('UPDATE INTERACTIONS', this.interactionsAtRoute);
        } else {
          this.interactionsAtRoute.push(ixLog);
          this.local.setItemForSession(this.IX_KEY, this.interactionsAtRoute);
          // console.log('UPDATE INTERACTIONS', this.interactionsAtRoute);
        }
      });
    }
  }

  constructor(
    private router: Router,
    private db: FirebaseService,
    private log: LogService,
    private local: SessionLocalStorageService,
    private session: SessionService,
  ) {
    // On visibility change to hidden, get latest stuff from session and
    // save it to the backend. Note that we are not deleting from localStorage
    // so that there is a backup.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const timeAtRoute = this.local.getItemForSession(this.TIME_KEY);
        // console.log('VISIBILITY CHANGE', timeAtRoute);
        if (timeAtRoute &&
          Object.prototype.hasOwnProperty.call(timeAtRoute, '__sessionId') &&
          Object.prototype.hasOwnProperty.call(timeAtRoute, 'route') &&
          Object.prototype.hasOwnProperty.call(timeAtRoute, 'startTime')
        ) {
          const interactionsAtRoute = this.local.getItemForSession(this.IX_KEY);
          if (!interactionsAtRoute) {
            this.log.rawLogOnBeaconEvent(timeAtRoute, 'logs', this.getLogId(timeAtRoute));
          } else {
            this.log.rawLogOnBeaconEvent({
              ...timeAtRoute,
              interactions: interactionsAtRoute,
            }, 'logs', this.getLogId(timeAtRoute));
          }
        }
      }
    }, { capture: true });


    /** Event timestamps from the user. */
    this.eventTimestamps$ = merge(
      fromEvent(document, 'mousemove').pipe(debounceTime(100)),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll').pipe(debounceTime(100)),
      fromEvent(document, 'DOMMouseScroll').pipe(debounceTime(100)),
      fromEvent(document, 'mousewheel').pipe(debounceTime(100)),
      fromEvent(document, 'touchmove').pipe(debounceTime(100)),
      fromEvent(document, 'MSPointerMove').pipe(debounceTime(100)),
    ).pipe(
      map(() => Date.now()),
    );

    /** Tracks the current route in your app. */
    this.currentRoute$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(({ urlAfterRedirects }: NavigationEnd) => urlAfterRedirects),
      publishReplay(1),
    ) as ConnectableObservable<string>;

    // Need to manually connect to make sure it gets the first one
    this.currentRoute$.connect();

    /** Tracks the active time at the current route. */
    this.runningTimeAtRoute$ = combineLatest([this.eventTimestamps$, this.currentRoute$, this.db.afUser()]).pipe(
      pairwise(),
      scan((timeAtRoute, [[timestamp1, route1, user1], [timestamp2, route2, user2]]) => {
        // Amount of inactive time that indicates not working
        // We're using 1 minute for now. Could probably use longer
        // cause people are likely to search for things online, and
        // that shouldn't count as 'inactive' time
        const BREAK_THRESHOLD = 1 * 60 * 1000;
        const interval = timestamp2 - timestamp1;
        const timeToRecord = interval > BREAK_THRESHOLD ? 0 : interval;
        const restToRecord = interval - timeToRecord;

        if (!timeAtRoute) {
          // If this is the very first event pair
          if (route1 === route2 && ((!user1 && !user2) || (user1 && user2 && user1.uid === user2.uid))) {
            return {
              ...(user1 && user1.uid ? { __userId: user1.uid } : {}),
              route: route1,
              startTime: timestamp1,
              time: [{
                type: 'active',
                total: timeToRecord,
              }],
            };
          } else {
            return {
              ...(user2 && user2.uid ? { __userId: user2.uid } : {}),
              route: route2,
              startTime: timestamp2,
              time: [{
                type: 'active',
                total: 0,
              }],
            };
          }
        } else {
          // For the remainder of events: look at the case when route and user are the same, and when there is a difference
          if (timeAtRoute.route === route2 && ((!timeAtRoute.__userId && !user2) || (user2 && timeAtRoute.__userId === user2.uid))) {
            const recentTimeEntry = timeAtRoute.time[timeAtRoute.time.length - 1];

            if (interval === 0) {
              // Some edge cases where the interval could actually be 0
              return timeAtRoute;
            } else if (recentTimeEntry.type === 'active' && timeToRecord > 0) {
              // If this is additional active time, add it to the previous count
              const newRecentTimeEntry = {
                type: 'active', total: recentTimeEntry.total + timeToRecord,
              };
              const newTimeArr = [...timeAtRoute.time.slice(0, timeAtRoute.time.length - 1), newRecentTimeEntry];

              return {
                ...(timeAtRoute.__userId ? { __userId: timeAtRoute.__userId } : {}),
                route: route2,
                startTime: timeAtRoute.startTime,
                time: newTimeArr,
              };
            } else if (recentTimeEntry.type === 'rest' && timeToRecord > 0) {
              // If this is new active time, make a new entry
              const newTimeArr = [...timeAtRoute.time, {
                type: 'active', total: timeToRecord,
              }];

              return {
                ...(timeAtRoute.__userId ? { __userId: timeAtRoute.__userId } : {}),
                route: route2,
                startTime: timeAtRoute.startTime,
                time: newTimeArr,
              };
            } else {
              // If this is rest time, make a new entry
              const newTimeArr = [...timeAtRoute.time, {
                type: 'rest', total: restToRecord,
              }];

              return {
                ...(timeAtRoute.__userId ? { __userId: timeAtRoute.__userId } : {}),
                route: route2,
                startTime: timeAtRoute.startTime,
                time: newTimeArr,
              };
            }
          } else {
            return {
              ...(user2 && user2.uid ? { __userId: user2.uid } : {}),
              route: route2,
              startTime: timestamp2,
              time: [{
                type: 'active', total: 0,
              }],
            };
          }
        }
      }, undefined),
      map((timeAtRoute) => {
        // Add in the __sessionId, __deviceId for each timeAtRoute
        return {
          __sessionId: this.session.getSessionId(),
          __deviceId: this.session.getDeviceId(),
          ...timeAtRoute,
        };
      }),
    );
  }
}
