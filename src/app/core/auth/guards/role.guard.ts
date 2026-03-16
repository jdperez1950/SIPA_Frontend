import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanMatchFn => {
  return (route: Route, segments: UrlSegment[]) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const user = authService.currentUser();
    
    // Check if user is logged in and has allowed role
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirect if not authorized (or just return false to skip route match)
    // If user is logged in but wrong role -> redirect to their home
    // If not logged in -> redirect to login
    if (user) {
      if (user.role === 'ORGANIZACION') {
        return router.createUrlTree(['/workspace']);
      }
      if (user.role === 'ASESOR') {
        return router.createUrlTree(['/advisor/dashboard']);
      }
      if (user.role === 'ADMIN') {
        return router.createUrlTree(['/admin/dashboard']);
      }
      return router.createUrlTree(['/dashboard']);
    } else {
      return router.createUrlTree(['/auth/login']);
    }
  };
};
