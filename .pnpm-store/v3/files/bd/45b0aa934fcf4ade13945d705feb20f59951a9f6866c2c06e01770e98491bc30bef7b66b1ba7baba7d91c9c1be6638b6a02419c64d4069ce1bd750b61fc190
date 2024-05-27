import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { OnboardingRoutingModule } from './onboarding-routing.module';

// Containers
import { WaitingComponent } from './waiting/waiting.component';
import { WaitingEffects } from './waiting/+state/waiting.effects';
import { ConsentComponent } from './consent/consent.component';
import { ConsentEffects } from './consent/+state/consent.effects';

// Components

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OnboardingRoutingModule,
    EffectsModule.forFeature([
      WaitingEffects,
      ConsentEffects,
    ]),
  ],
  declarations: [
    // Containers
    WaitingComponent,
    ConsentComponent,
    // Components
  ],
})
export class OnboardingModule { }
