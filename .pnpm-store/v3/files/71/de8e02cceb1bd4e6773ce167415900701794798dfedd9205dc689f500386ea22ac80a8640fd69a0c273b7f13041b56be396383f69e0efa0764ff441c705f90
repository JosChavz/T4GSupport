import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

// Containers
import { WaitlistComponent } from './waitlist/waitlist.component';
import { WaitlistEffects } from './waitlist/+state/waitlist.effects';

// Components

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    EffectsModule.forFeature([
      WaitlistEffects,
    ]),
  ],
  declarations: [
    // Containers
    WaitlistComponent,
    // Components
  ],
})
export class AdminModule { }
