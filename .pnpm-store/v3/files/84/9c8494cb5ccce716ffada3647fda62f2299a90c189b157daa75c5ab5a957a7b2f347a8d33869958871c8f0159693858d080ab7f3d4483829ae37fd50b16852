import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject, from, ConnectableObservable } from 'rxjs';
import { startWith, multicast, distinctUntilChanged, tap, skip, map, filter, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DetectRedeploymentService {
  /** Event stream that emits when an app redeployment is detected. */
  private redeployed$: Observable<void>;
  private initialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  /** Sets redeployed$ and returns it. */
  public init() {
    // Matches the filename of the main javascript file, which contains the hash in the name
    const regexp = /main[-a-z0-9]*\.([a-f0-9]*)\.js/;

    const observable: ConnectableObservable<void> = interval(2 * 60 * 1000) // every 2 minutes
      .pipe(
        startWith(0),
        // Fetch index.html with a timestamp query parameter so it definitely doesn't get cached anywhere.
        mergeMap(() => fetch('/index.html?t=' + Date.now())),
        mergeMap((urlResponse) => urlResponse.text()),
        map((responseText) => {
          const m = responseText.match(regexp);
          if (m === null) {
            // Probably running a dev build or something where there's no hash.
            // No biggie, we'll just do nothing.
            return null;
          } else {
            return m[1];
          }
        }),
        filter((val) => !!val),
        // Only emit when there are unique versions
        distinctUntilChanged(),
        // Skip the first starting version so we only get changes
        skip(1),
        // Modeled after example 1 in: https://www.learnrxjs.io/operators/multicasting/multicast.html
        multicast(() => new Subject()),
      ) as ConnectableObservable<void>;

    observable.connect();

    this.redeployed$ = observable;
    this.initialized$.next(true);

    return observable;
  }

  public redeployed() {
    return this.initialized$.pipe(
      filter((val) => val),
      mergeMap(() => this.redeployed$),
    );
  }

  public refresh() {
    window.location.reload();
  }
}
