import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, map, catchError, delay } from 'rxjs/operators';
import { User } from '../../models/domain.models';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, ValidateTokenResponse } from '../models/auth.models';
import { ConfirmationService } from '../../services/confirmation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private confirmationService = inject(ConfirmationService);
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'pavis_token';
  private readonly USER_KEY = 'pavis_user';
  
  // Private signal for user state
  #currentUser = signal<User | null>(null);

  // Computed for checking authentication status
  isAuthenticated = computed(() => !!this.#currentUser());
  
  // Public readonly access to current user
  currentUser = this.#currentUser.asReadonly();

  constructor() {
    this.restoreSession();
    this.setupAutoLogout();
  }

  private setupAutoLogout() {
    if (isPlatformBrowser(this.platformId)) {
      const resetTimer = () => {
        if (this.isAuthenticated()) {
          this.startInactivityTimer();
        }
      };

      ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      
      this.startInactivityTimer();
    }
  }

  private logoutTimer: any;
  private readonly INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

  private startInactivityTimer() {
    clearTimeout(this.logoutTimer);
    if (this.isAuthenticated()) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
        this.confirmationService.alert({
          title: 'Sesión Expirada',
          message: 'Tu sesión ha sido cerrada por inactividad.',
          type: 'info'
        });
      }, this.INACTIVITY_LIMIT);
    }
  }

  private restoreSession() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem(this.USER_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);
      
      if (storedUser && token) {
        try {
          this.#currentUser.set(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user', e);
          this.logout();
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setToken(response.data.token);
          return response.data.user;
        }
        throw new Error(response.message || 'Error en autenticación');
      }),
      tap(user => {
        this.#currentUser.set(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.startInactivityTimer();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al iniciar sesión';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      map(response => {
        if (response.success && response.data) {
          // Note: We do NOT set the token here because this method might be used by an Admin
          // to create OTHER users. If it's a self-registration, the caller should handle login.
          // However, for standard self-registration, we might want to auto-login.
          // For now, we return the created User. The caller can decide to use the token if needed
          // (but we are only returning the User here).
          // If we need the token, we should return the full AuthResponse or a wrapper.
          // Given the Admin use case, returning just User is safer to avoid accidental session switches.
          return response.data.user;
        }
        throw new Error(response.message || 'Error en el registro');
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al registrar usuario';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.#currentUser.set(null);
    clearTimeout(this.logoutTimer);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.clear();
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  recoverPassword(email: string): Observable<boolean> {
    // Endpoint: /auth/restore-password (Solo ADMIN segun reglas de negocio)
    // Requiere autenticación (token JWT de Admin)
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/restore-password`, { email }).pipe(
      map(response => response.success),
      catchError((error) => {
        console.error('Error restoring password:', error);
        return of(false);
      })
    );
  }
  
  validateToken(): Observable<boolean> {
     const token = this.getToken();
     if (!token) return of(false);
     
     return this.http.post<ValidateTokenResponse>(`${this.apiUrl}/auth/validate`, { token }).pipe(
        map(res => res.success && res.data),
        catchError(() => of(false))
     );
  }
}
