import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// Containers
import { LandingComponent } from './general/landing/landing.component';

// Our general approach is to load the GeneralModule eagerly and everything lazily (but with preloading)
const appRoutes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then((mod) => mod.AdminModule) },
  { path: 'onboarding', loadChildren: () => import('./onboarding/onboarding.module').then((mod) => mod.OnboardingModule) },
  { path: '', component: LandingComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
