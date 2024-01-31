import { NgModule, Optional, SkipSelf, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { throwIfAlreadyLoaded } from './setup/module-import-guard';

import { environment } from '../../environments/environment';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MainAngularFirestore, LoggingAngularFirestore, MainAngularFirestoreFactory, LoggingAngularFirestoreFactory } from './setup/firebase-setup';

// NgRx
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, RouterState } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/app.effects';

// Auth
import { AuthEffects } from './store/auth/auth.effects';

// Entity Effects
import { AppStateEffects } from './store/app-state/app-state.effects';
import { UserContextEffects } from './store/user-context/user-context.effects';
import { UserEffects } from './store/user/user.effects';

// Service Effects
import { SnackbarEffects } from './snackbar/snackbar.effects';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictActionImmutability: false,
      },
    }),
    StoreRouterConnectingModule.forRoot({ routerState: RouterState.Minimal }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      AppEffects,
      AuthEffects,
      // Service Effects
      SnackbarEffects,
      // Entity Effects
      AppStateEffects,
      UserContextEffects,
      UserEffects,
    ]),
  ],
  declarations: [],
  exports: [],
  providers: [
    { provide: MainAngularFirestore, deps: [PLATFORM_ID, NgZone], useFactory: MainAngularFirestoreFactory },
    { provide: LoggingAngularFirestore, deps: [PLATFORM_ID, NgZone], useFactory: LoggingAngularFirestoreFactory },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
