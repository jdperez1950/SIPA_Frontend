import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Private signal for user state
  #currentUser = signal<User | null>(null);

  // Computed for checking authentication status
  isAuthenticated = computed(() => !!this.#currentUser());
  
  // Public readonly access to current user
  currentUser = this.#currentUser.asReadonly();

  constructor() {}

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
      tap(user => this.#currentUser.set(user))
    );
  }

  logout(): void {
    this.#currentUser.set(null);
  }

  recoverPassword(email: string): Observable<boolean> {
    return of(true).pipe(delay(1500));
  }
}
