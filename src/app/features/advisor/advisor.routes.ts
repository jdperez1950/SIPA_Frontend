import { Routes } from '@angular/router';

export const ADVISOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/advisor-dashboard/advisor-dashboard.component').then(m => m.AdvisorDashboardComponent)
  }
];
