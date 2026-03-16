import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  {
    path: 'workspace',
    canActivate: [authGuard],
    loadChildren: () => import('./features/project-workspace/project-workspace.routes').then(m => m.PROJECT_WORKSPACE_ROUTES)
  },
  {
    path: 'organization',
    canMatch: [roleGuard(['ORGANIZACION'])],
    loadChildren: () => import('./features/organization/organization.routes').then(m => m.ORGANIZATION_ROUTES)
  },
  {
    path: 'consultant',
    canMatch: [roleGuard(['CONSULTA'])],
    loadChildren: () => import('./features/consultant/consultant.routes').then(m => m.CONSULTANT_ROUTES)
  },
  {
    path: 'advisor',
    canMatch: [roleGuard(['ASESOR'])],
    loadChildren: () => import('./features/advisor/advisor.routes').then(m => m.ADVISOR_ROUTES)
  },
  {
    path: 'admin',
    canMatch: [roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./core/pages/maintenance-page/maintenance-page.component').then(m => m.MaintenancePageComponent)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent)
  }
];
