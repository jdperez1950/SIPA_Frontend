import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { publicGuard } from '../../core/auth/guards/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
    canActivate: [publicGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
