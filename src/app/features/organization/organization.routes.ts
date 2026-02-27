import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  },
  {
    path: 'panel',
    loadComponent: () => import('./pages/organization-dashboard-panel/organization-dashboard-panel.component').then(m => m.OrganizationDashboardPanelComponent)
  }
];
