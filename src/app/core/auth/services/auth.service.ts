import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { tap, map, catchError, delay, switchMap } from 'rxjs/operators';
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
  private router = inject(Router);
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

  private lastActivity = 0;
  private readonly ACTIVITY_THROTTLE = 1000; // 1 second

  private setupAutoLogout() {
    if (isPlatformBrowser(this.platformId)) {
      const resetTimer = () => {
        const now = Date.now();
        // Throttle to avoid excessive timer resets
        if (now - this.lastActivity < this.ACTIVITY_THROTTLE) {
          return;
        }
        this.lastActivity = now;

        if (this.isAuthenticated()) {
          // If warning was shown and user is active, close the warning modal
          if (this.warningShown) {
             this.confirmationService.close();
             this.warningShown = false;
          }
          this.startInactivityTimer();
        }
      };

      ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      
      // Only start timer if user is already authenticated
      if (this.isAuthenticated()) {
        this.startInactivityTimer();
      }
    }
  }

  private logoutTimer: any;
  private warningTimer: any;
  private readonly INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
  private readonly INACTIVITY_WARNING = 0.5 * 60 * 1000; // 30 seconds before logout
  private warningShown = false;

  private periodicValidationTimer: any;
  private readonly TOKEN_VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private startInactivityTimer() {
    clearTimeout(this.logoutTimer);
    clearTimeout(this.warningTimer);
    if (this.isAuthenticated()) {
      this.warningShown = false;

      // Warning timer (30 seconds before logout)
      this.warningTimer = setTimeout(() => {
        if (this.isAuthenticated()) {
          this.warningShown = true;
          this.confirmationService.alert({
            title: 'Sesión por Expirar',
            message: 'Tu sesión expirará en 30 segundos por inactividad.',
            type: 'warning'
          });
        }
      }, this.INACTIVITY_LIMIT - this.INACTIVITY_WARNING);

      // Logout timer
      this.logoutTimer = setTimeout(() => {
        clearTimeout(this.warningTimer);
        this.forceLogoutWithMessage('Tu sesión ha sido cerrada por inactividad');
      }, this.INACTIVITY_LIMIT);
    }
  }

  private forceLogoutWithMessage(message: string, showWarning: boolean = true) {
    this.logout();

    if (showWarning) {
      this.confirmationService.alert({
        title: 'Sesión Cerrada',
        message: message,
        type: 'info'
      });
    }

    this.router.navigate(['/auth/login']);
  }

  private startPeriodicTokenValidation() {
    if (isPlatformBrowser(this.platformId)) {
      clearTimeout(this.periodicValidationTimer);

      this.periodicValidationTimer = setInterval(() => {
        if (this.isAuthenticated()) {
          this.validateToken().subscribe(isValid => {
            if (!isValid) {
              console.warn('Token expirado en validación periódica');
              this.forceLogoutWithMessage('', false);
            }
          });
        } else {
          clearTimeout(this.periodicValidationTimer);
        }
      }, this.TOKEN_VALIDATION_INTERVAL);
    }
  }

  private stopPeriodicTokenValidation() {
    clearTimeout(this.periodicValidationTimer);
  }

  private restoreSession() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem(this.USER_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);

      if (storedUser && token) {
        try {
          // Primero seteamos el usuario localmente para no bloquear la UI
          const parsedUser = JSON.parse(storedUser);
          this.#currentUser.set(parsedUser);

          // Validamos el token en background
          console.log('Restaurando sesión, validando token...');
          this.validateToken().subscribe(isValid => {
            console.log('Resultado validación token:', isValid);
            if (!isValid) {
              console.warn('Token inválido o expirado al restaurar sesión');
              this.forceLogoutWithMessage('', false);
            } else {
              // Si es válido, reiniciamos el timer de inactividad y comenzamos validación periódica
              this.startInactivityTimer();
              this.startPeriodicTokenValidation();
            }
          });

        } catch (e) {
          console.error('Error parsing stored user', e);
          this.logout();
        }
      }
    }
  }

  getUsers(params: any): Observable<any> {
    // Construct query string
    const queryParams = Object.keys(params)
      .map(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          return `${key}=${encodeURIComponent(params[key])}`;
        }
        return null;
      })
      .filter(p => p !== null)
      .join('&');

    return this.http.get<any>(`${this.apiUrl}/auth/users?${queryParams}`);
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      switchMap(response => {
        if (response.success && response.data && response.data.user && response.data.token) {
          this.setToken(response.data.token);
          this.#currentUser.set(response.data.user);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
            this.startInactivityTimer();
            this.startPeriodicTokenValidation();
          }
          return of(response.data.user);
        }
        return throwError(() => new Error(response.message || 'Error en autenticación'));
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
      switchMap(response => {
        if (response.success && response.data && response.data.user) {
          return of(response.data.user);
        }
        return throwError(() => new Error(response.message || 'Error en el registro'));
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
    clearTimeout(this.warningTimer);
    this.stopPeriodicTokenValidation();
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

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.patch<AuthResponse>(`${this.apiUrl}/auth/users`, user).pipe(
      switchMap(response => {
        if (response.success && response.data && response.data.user) {
          return of(response.data.user);
        }
        return throwError(() => new Error(response.message || 'Error al actualizar usuario'));
      })
    );
  }

  toggleUserStatus(id: string, status: string): Observable<User> {
    return this.http.patch<AuthResponse>(`${this.apiUrl}/auth/users/status`, { id, status }).pipe(
      switchMap(response => {
        if (response.success && response.data && response.data.user) {
          return of(response.data.user);
        }
        return throwError(() => new Error(response.message || 'Error al cambiar estado de usuario'));
      })
    );
  }
  
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    // El endpoint de validación es POST y requiere el token en el body o header
    // Asumimos que el backend espera { token: string } en el body si es POST
    return this.http.post<ValidateTokenResponse>(`${this.apiUrl}/auth/validate`, { token }).pipe(
      tap(res => console.log('Respuesta validateToken API:', res)),
      map(response => response.success && response.data),
      catchError((err) => {
        console.error('Error validateToken API:', err);

        // Si es error de conexión (ECONNREFUSED, ENOTFOUND, etc), no cerramos sesión
        // Esto permite que la app siga funcionando si el backend está temporalmente caído
        if (err.status === 0 || err.error instanceof ErrorEvent) {
          console.warn('Error de red, no cerrando sesión temporalmente');
          return of(true); // Asumimos válido para evitar desconexión
        }

        // Si es error del servidor (401, 403, 500), entonces cerramos sesión
        return of(false);
      })
    );
  }
}
