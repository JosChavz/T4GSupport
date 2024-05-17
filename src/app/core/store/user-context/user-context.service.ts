import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CachedSelectorsService } from '../cached-selectors.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserContext } from './user-context.model';

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  constructor(
    private cs: CachedSelectorsService,
    private db: FirebaseService,
  ) { }

  /** Select a userContext from the store. */
  public selectUserContext = <T extends UserContext>(
    id: string,
    correlationId: string,
    childrenFn?: (e: UserContext) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.cs.selectEntityObj<UserContext, T>('userContext', id, correlationId, childrenFn);
  };

  /** Select userContexts from the store. */
  public selectUserContexts = <T extends UserContext>(
    queryParams: [string, string, any][],
    correlationId: string,
    childrenFn?: (e: UserContext) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.cs.selectEntityList<UserContext, T>('userContext', queryParams, correlationId, childrenFn);
  };

  /** Get a userContext directly from the database. */
  public getUserContext = <T extends UserContext>(
    id: string,
    childrenFn?: (e: UserContext) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.db.queryObjOnce<UserContext, T>('userContexts', id, childrenFn);
  };

  /** Get userContexts directly from the database. */
  public getUserContexts = <T extends UserContext>(
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
    childrenFn?: (e: UserContext) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.db.queryListOnce<UserContext, T>('userContexts', queryParams, queryOptions, childrenFn);
  };
}
