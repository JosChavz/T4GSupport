import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';

// Containers
import { WaitingComponent } from './waiting/waiting.component';
import { ConsentComponent } from './consent/consent.component';

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'waiting', component: WaitingComponent, canActivate: [AuthGuard] },
  { path: 'consent', component: ConsentComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule { }
