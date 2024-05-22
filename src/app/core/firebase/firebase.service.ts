import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, combineLatest, merge, of, from, pipe } from 'rxjs';
import { tap, pluck, mergeMap, filter, takeUntil, skip, switchMap, map, take } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) {
    this.afStore.firestore.useEmulator('localhost', 8080);
    this.afAuth.useEmulator('http://localhost:9099/');
  }

  /** Creates a unique id */
  createId = (): string => {
    return this.afStore.createId();
  };

  afUser = () => {
    return this.afAuth.user;
  };

  login = (providerId, scope?: string): Observable<any> => {
    const provider = this.getProvider(providerId, scope);

    if (provider) {
      return from(this.afAuth.signInWithPopup(provider)).pipe(
        mergeMap((results) => {
          return this.queryObjOnce('users', results.user.uid).pipe(
            map((dbUser) => Object.assign({}, results, { dbUser })),
          );
        }),
      );
    } else {
      return of(undefined);
    }
  };

  private getProvider(providerId, scope?: string) {
    let provider;
    switch (providerId) {
      case 'google.com': {
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      }
      case 'github.com': {
        provider = new firebase.auth.GithubAuthProvider();
        break;
      }
    }
    if (provider && scope) {
      provider.addScope(scope);
    }
    return provider;
  }

  loginLink = (error) => {
    firebase.auth().fetchSignInMethodsForEmail(error.email)
      .then((providers) => {
        this.queryListOnce('users', [['email', '==', error.email]]).subscribe((users) => {
          firebase.auth().signInWithPopup(this.getProvider(providers[0])).then((auth1) => {
            firebase.auth().signInWithCredential(auth1.credential)
              .then((auth2) => {
                auth2.user.linkWithCredential(error.credential);
              })
            .catch((error2) => console.log(error2));
          });
        });
      });
  };

  logout = (): Observable<any> => {
    return from(this.afAuth.signOut());
  };

  queryObjValueChanges = <T>(collection: string, id: string) => {
    return this.afStore.doc<T>(`/${collection}/${id}`).valueChanges();
  };

  queryObjOnce<S>(
    collection: string,
    id: string,
  ): Observable<S>;

  queryObjOnce<S, T>(
    collection: string,
    id: string,
    childrenFn?: (e: S) => { [index: string]: Observable<any> },
  ): Observable<T>;

  queryObjOnce<S, T>(
    collection: string,
    id: string,
    childrenFn?: (e: S) => { [index: string]: Observable<any> },
  ): Observable<T> {
    return this.queryObjValueChanges<S>(collection, id).pipe(
      take(1),
      switchMap((e) => {
        if (!e || !childrenFn) {
          return of(e);
        } else {
          const children = childrenFn(e);
          // transform the hash of observables into an array of observable hashes
          const obsArray = Object.keys(children).map((objKey) => {
            const obs = children[objKey];
            return obs.pipe(
              map((entity) => {
                const obj = {};
                obj[objKey] = entity;
                return obj;
              }),
            );
          });
          return obsArray.length === 0 ? of(e) : combineLatest(obsArray).pipe(
            map((array) => {
              return Object.assign({}, e, ...array);
            }),
          );
        }
      }),
    );
  }

  queryListStateChanges = <T>(collection, queryParams, queryOptions?) => {
    let stateChangeObs$;

    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      stateChangeObs$ = this.afStore.collection<T>(`/${collection}`).stateChanges();
    } else {
      stateChangeObs$ = this.afStore.collection<T>(
        `/${collection}`,
        this.constructQueryListRef(queryParams, queryOptions),
      ).stateChanges();
    }

    return stateChangeObs$.pipe(
      map((changes: any[]) => {
        return changes.map((change) => {
          return {
            type: change.type,
            result: change.payload.doc.data(),
          };
        });
      }),
    );
  };

  queryListValueChanges = <T>(collection, queryParams, queryOptions?) => {
    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      return this.afStore.collection<T>(`/${collection}`).valueChanges();
    } else {
      return this.afStore.collection<T>(
        `/${collection}`,
        this.constructQueryListRef(queryParams, queryOptions),
      ).valueChanges();
    }
  };

  private constructQueryListRef = (queryParams, queryOptions?) => (ref) => {
    const refWithQueries = queryParams.reduce((func, query) => {
      const [prop, comp, val] = query;
      return func.where(prop, comp, val);
    }, ref);
    if (!queryOptions) {
      queryOptions = {};
    }
    return Object.keys(queryOptions).reduce((func, queryKey) => {
      switch (queryKey) {
        case 'orderBy': {
          if (Array.isArray(queryOptions.orderBy)) {
            return func.orderBy(...queryOptions.orderBy);
          } else {
            return func.orderBy(queryOptions.orderBy);
          }
        }
        case 'limit':
          return func.limit(queryOptions.limit);

        case 'startAt':
          return func.startAt(queryOptions.startAt);

        case 'startAfter':
          return func.startAfter(queryOptions.startAfter);

        case 'endAt':
          return func.endAt(queryOptions.endAt);

        case 'endBefore':
          return func.endBefore(queryOptions.endBefore);

        default:
          return func;
      }
    }, refWithQueries);
  };

  queryListOnce<S>(
    collection: string,
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
  ): Observable<S[]>;

  queryListOnce<S, T>(
    collection: string,
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
    childrenFn?: (e: S) => { [index: string]: Observable<any> },
  ): Observable<T[]>;

  queryListOnce<S, T>(
    collection: string,
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
    childrenFn?: (e: S) => { [index: string]: Observable<any> },
  ): Observable<T[]> {
    return this.queryListValueChanges<S>(collection, queryParams, queryOptions).pipe(
      take(1),
      switchMap((entities) => {
        if (!entities || !childrenFn || entities.length === 0) {
          return of(entities);
        } else {
          return combineLatest(entities.map((e) => {
            // If there are children, then we need to transform the hash of observables into an observable with the data object
            const children = childrenFn(e);

            const obsArray = Object.keys(children).map((objKey) => {
              const obs = children[objKey];
              return obs.pipe(
                map((entity) => {
                  const obj = {};
                  obj[objKey] = entity;
                  return obj;
                }),
              );
            });
            return obsArray.length === 0 ? of(e) : combineLatest(obsArray).pipe(
              map((array) => {
                return Object.assign({}, e, ...array);
              }),
            );
          }));
        }
      }),
    );
  }

  addEntity = (collection, entity) => {
    return from(this.afStore.doc(`/${collection}/${entity.__id}`).set(Object.assign({}, entity, {
      _createdAt: firebase.firestore.Timestamp.now(), // TODO: update to ServerValue.TIMESTAMP since more accurate
      _updatedAt: firebase.firestore.Timestamp.now(), // TODO: update to ServerValue.TIMESTAMP since more accurate
    })));
  };

  updateEntity = (collection, id, changes) => {
    return from(this.afStore.doc(`/${collection}/${id}`).update(Object.assign({}, changes, {
      _updatedAt: firebase.firestore.Timestamp.now(),
    })));
  };

  upsertEntity = (collection, entity): Observable<{ type: string, value: any }> => {
    return from((async () => {
      const dbEntity = await this.queryObjOnce(collection, entity.__id).toPromise();
      if (dbEntity) {
        return {
          type: 'update',
          value: await this.updateEntity(collection, entity.__id, entity),
        };
      } else {
        return {
          type: 'add',
          value: await this.addEntity(collection, entity),
        };
      }
    })());
  };

  removeEntity = (collection, id) => {
    return from(this.afStore.doc(`/${collection}/${id}`).delete());
  };
}
