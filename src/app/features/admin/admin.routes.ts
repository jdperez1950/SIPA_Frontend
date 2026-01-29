import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardPageComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin-users-page/admin-users-page.component').then(m => m.AdminUsersPageComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/admin-projects-page/admin-projects-page.component').then(m => m.AdminProjectsPageComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./pages/admin-organizations-page/admin-organizations-page.component').then(m => m.AdminOrganizationsPageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin-settings-page/admin-settings-page.component').then(m => m.AdminSettingsPageComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/admin-reports-page/admin-reports-page.component').then(m => m.AdminReportsPageComponent)
      }
    ]
  }
];
