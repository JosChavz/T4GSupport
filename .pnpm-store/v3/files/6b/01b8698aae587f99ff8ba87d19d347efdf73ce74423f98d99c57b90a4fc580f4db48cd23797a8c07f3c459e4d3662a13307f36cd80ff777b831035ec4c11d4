import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { AppCheckInstances } from '@angular/fire/app-check';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../../../environments/environment';

@Injectable()
export class MainAngularFirestore extends AngularFirestore { }

@Injectable()
export class LoggingAngularFirestore extends AngularFirestore { }

export function MainAngularFirestoreFactory(platformId: Record<string, unknown>, zone: NgZone): MainAngularFirestore {
  const schedulers = new ɵAngularFireSchedulers(zone);
  const auth = new AngularFireAuth(environment.firebase, 'mainAuth', platformId, zone, schedulers, null, null, null, null, null, null, new AppCheckInstances());

  return new MainAngularFirestore(environment.firebase, 'main', true, {}, platformId, zone, schedulers, {}, null, auth, null, null, null, null, null, null, new AppCheckInstances());
}

export function LoggingAngularFirestoreFactory(platformId: Record<string, unknown>, zone: NgZone): LoggingAngularFirestore {
  const schedulers = new ɵAngularFireSchedulers(zone);
  const auth = new AngularFireAuth(environment.firebase, 'loggingAuth', platformId, zone, schedulers, null, null, null, null, null, null, new AppCheckInstances());
  return new LoggingAngularFirestore(environment.firebaseLogs, 'logging', true, {}, platformId, zone, schedulers, {}, null, auth, null, null, null, null, null, null, new AppCheckInstances());
}
