import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CachedSelectorsService } from '../cached-selectors.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { AppState } from './app-state.model';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  constructor(
    private cs: CachedSelectorsService,
    private db: FirebaseService,
  ) { }

  /** Select a appState from the store. */
  public selectAppState = <T extends AppState>(
    id: string,
    correlationId: string,
    childrenFn?: (e: AppState) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.cs.selectEntityObj<AppState, T>('appState', id, correlationId, childrenFn);
  };

  /** Select appStates from the store. */
  public selectAppStates = <T extends AppState>(
    queryParams: [string, string, any][],
    correlationId: string,
    childrenFn?: (e: AppState) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.cs.selectEntityList<AppState, T>('appState', queryParams, correlationId, childrenFn);
  };

  /** Get a appState directly from the database. */
  public getAppState = <T extends AppState>(
    id: string,
    childrenFn?: (e: AppState) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.db.queryObjOnce<AppState, T>('appStates', id, childrenFn);
  };

  /** Get appStates directly from the database. */
  public getAppStates = <T extends AppState>(
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
    childrenFn?: (e: AppState) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.db.queryListOnce<AppState, T>('appStates', queryParams, queryOptions, childrenFn);
  };
}
