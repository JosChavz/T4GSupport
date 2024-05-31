import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { GeneralRoutingModule } from './general-routing.module';

// Containers
import { LandingComponent } from './landing/landing.component';
import { LandingEffects } from './landing/+state/landing.effects';

// Components
import { SignupComponent } from './landing/signup/signup.component';
import { SigninComponent } from './landing/signin/signin.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    GeneralRoutingModule,
    EffectsModule.forFeature([
      LandingEffects,
    ]),
    NgOptimizedImage,
  ],
  declarations: [
    // Containers
    LandingComponent,
    // Components
    SignupComponent,
    SigninComponent,
  ],
  exports: [
  ],
})
export class GeneralModule { }
