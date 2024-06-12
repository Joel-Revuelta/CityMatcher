import { Routes } from '@angular/router';

// only route is details, anything else redirects to '' (home)
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
