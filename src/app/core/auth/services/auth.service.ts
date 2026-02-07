import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  
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
        alert('Sesión cerrada por inactividad.'); // Simple alert for now, could be better UI
      }, this.INACTIVITY_LIMIT);
    }
  }

  private restoreSession() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('pavis_user');
      if (storedUser) {
        try {
          this.#currentUser.set(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user', e);
          localStorage.removeItem('pavis_user');
        }
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return of(true).pipe(
      delay(1500),
      switchMap(() => {
        if (credentials.email === 'demo@demo.com' && credentials.password === '123456789') {
          const mockUser: User = { 
            id: '1', 
            role: 'ADMIN', 
            name: 'Usuario Demo',
            email: credentials.email
          };
          return of(mockUser);
        }
        
        if (credentials.email === 'org@demo.com' && credentials.password === '123456789') {
          const mockOrgUser: User = { 
            id: '2', 
            role: 'ORGANIZACION', 
            name: 'Organización Demo',
            email: credentials.email
          };
          return of(mockOrgUser);
        }

        return throwError(() => new Error('Credenciales inválidas'));
      }),
      tap(user => {
        this.#currentUser.set(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('pavis_user', JSON.stringify(user));
          this.startInactivityTimer();
        }
      })
    );
  }

  logout(): void {
    this.#currentUser.set(null);
    clearTimeout(this.logoutTimer);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pavis_user');
      sessionStorage.clear(); // Clear any session data
    }
  }

  recoverPassword(email: string): Observable<boolean> {
    return of(true).pipe(delay(1500));
  }
}
