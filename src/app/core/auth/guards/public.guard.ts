import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    
    // Redirigir según el rol del usuario (consistente con login-page logic)
    if (user?.role === 'ADMIN') {
      return router.createUrlTree(['/admin/dashboard']);
    } else if (user?.role === 'ORGANIZACION') {
      return router.createUrlTree(['/workspace']);
    } else {
      return router.createUrlTree(['/dashboard']);
    }
  }

  return true;
};
