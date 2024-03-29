import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { GeneralRoutingModule } from './general-routing.module';

// Containers
import { HomeComponent } from './home/home.component';
import { HomeEffects } from './home/+state/home.effects';
import { LandingComponent } from './landing/landing.component';
import { LandingEffects } from './landing/+state/landing.effects';
import { LoginComponent } from './login/login.component';

// Components

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    GeneralRoutingModule,
    EffectsModule.forFeature([
      HomeEffects,
      LandingEffects,
    ]),
  ],
  declarations: [
    // Containers
    HomeComponent,
    LandingComponent,
    LoginComponent,
    // Components
  ],
  exports: [
  ],
})
export class GeneralModule { }
