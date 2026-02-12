import { Routes } from '@angular/router';

export const CONSULTANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/consultant-dashboard/consultant-dashboard.component').then(m => m.ConsultantDashboardComponent)
  }
];
