import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Use explicit injection to avoid circular dependency
  // But AuthService is needed for getToken().
  // The circular dependency happens because AuthService uses HttpClient, which uses this Interceptor, which injects AuthService.
  
  // To break the cycle, we can:
  // 1. Manually get token from localStorage (if platform is browser)
  // 2. Or use Injector to get AuthService lazily (but HttpInterceptorFn is a function)
  
  // Let's try the manual localStorage approach for the token, as it's simpler and breaks the dependency chain for getToken().
  // However, for logout() we still need AuthService or Router.
  
  // Better approach: Use a separate TokenService or simple helper.
  // Or: Just use localStorage directly here since we know the key.
  
  let token: string | null = null;
  
  try {
    // Check if running in browser
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('pavis_token');
    }
  } catch (e) {
    // Ignore error in SSR or if localStorage is not available
  }

  const router = inject(Router);
  const confirmationService = inject(ConfirmationService);
  // We can't inject AuthService directly here if it causes circular dep.
  // But we need it for logout logic.
  // Let's inject it lazily inside the error block if possible, or just use Router and clear storage manually.

  let request = req;

  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auto-logout on 401 Unauthorized, except for login endpoint
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Manually clear session to avoid circular dep with AuthService.logout()
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('pavis_user');
          localStorage.removeItem('pavis_token');
          sessionStorage.clear();
        }
        
        // Show session expired message
        confirmationService.alert({
          title: 'Sesión Expirada',
          message: 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
          type: 'info',
          confirmText: 'Entendido'
        });

        router.navigate(['/auth/login']);
      }
      
      // Handle 403 Forbidden
      if (error.status === 403) {
        confirmationService.alert({
          title: 'Acceso Denegado',
          message: 'No tienes permisos para realizar esta acción.',
          type: 'warning',
          confirmText: 'Entendido'
        });
      }

      return throwError(() => error);
    })
  );
};
