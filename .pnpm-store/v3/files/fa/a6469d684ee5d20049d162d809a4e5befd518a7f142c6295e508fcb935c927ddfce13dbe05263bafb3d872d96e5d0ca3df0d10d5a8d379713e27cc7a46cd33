import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CachedSelectorsService } from '../cached-selectors.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private cs: CachedSelectorsService,
    private db: FirebaseService,
  ) { }

  /** Select a user from the store. */
  public selectUser = <T extends User>(
    id: string,
    correlationId: string,
    childrenFn?: (e: User) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.cs.selectEntityObj<User, T>('user', id, correlationId, childrenFn);
  };

  /** Select users from the store. */
  public selectUsers = <T extends User>(
    queryParams: [string, string, any][],
    correlationId: string,
    childrenFn?: (e: User) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.cs.selectEntityList<User, T>('user', queryParams, correlationId, childrenFn);
  };

  /** Get a user directly from the database. */
  public getUser = <T extends User>(
    id: string,
    childrenFn?: (e: User) => { [index: string]: Observable<any> },
  ): Observable<T> => {
    return this.db.queryObjOnce<User, T>('users', id, childrenFn);
  };

  /** Get users directly from the database. */
  public getUsers = <T extends User>(
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
    childrenFn?: (e: User) => { [index: string]: Observable<any> },
  ): Observable<Array<T>> => {
    return this.db.queryListOnce<User, T>('users', queryParams, queryOptions, childrenFn);
  };
}
