import { HttpInterceptorFn, HttpErrorResponse, HttpEventType, HttpResponse, HttpBackend, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RefreshTokenResponse } from '../models/auth.models';

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
  const httpBackend = inject(HttpBackend); // Inject HttpBackend to bypass interceptors

  let refreshToken: string | null = null;
  try {
    if (typeof localStorage !== 'undefined') {
      refreshToken = localStorage.getItem('pavis_refresh_token');
    }
  } catch (e) {}

  let request = req;

  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    tap(event => {
      // Check for new token in response headers (Sliding Session)
      // This helps prevent expiration if the user is active but the token is expiring
      if (event.type === HttpEventType.Response && event instanceof HttpResponse) {
        const newToken = event.headers.get('Authorization') || event.headers.get('x-token') || event.headers.get('new-token');
        if (newToken) {
          try {
            const tokenValue = newToken.replace('Bearer ', '');
            if (typeof localStorage !== 'undefined' && tokenValue) {
              localStorage.setItem('pavis_token', tokenValue);
            }
          } catch (e) {
            console.error('Error updating token from header', e);
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Auto-logout on 401 Unauthorized, except for login and refresh endpoints
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        
        // Attempt to refresh token using the REFRESH TOKEN (not the expired access token)
        if (refreshToken) {
          const http = new HttpClient(httpBackend);
          return http.post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh`, { token: refreshToken }).pipe(
            switchMap((response) => {
              if (response.success && response.data && response.data.token) {
                const newToken = response.data.token;
                
                // Update token in storage
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('pavis_token', newToken);
                }
                
                // Retry request with new token
                const newReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                
                return next(newReq);
              }
              // If refresh response is not successful, throw error to trigger logout
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              // If refresh fails, perform logout
              handleLogout(confirmationService, router);
              return throwError(() => refreshError);
            })
          );
        }

        // If no refresh token, just logout
        handleLogout(confirmationService, router);
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

function handleLogout(confirmationService: ConfirmationService, router: Router) {
  // Manually clear session to avoid circular dep with AuthService.logout()
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('pavis_user');
    localStorage.removeItem('pavis_token');
    localStorage.removeItem('pavis_refresh_token');
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
