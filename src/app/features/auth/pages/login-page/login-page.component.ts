import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, ],
  templateUrl: './login-page.component.html',
  styles: []
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  handleLogin(credentials: {email: string, password: string}) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        // Redirect based on Role
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user.role === 'ORGANIZACION') {
          this.router.navigate(['/organization/panel']);
        } else if (user.role === 'ASESOR') {
          this.router.navigate(['/advisor/dashboard']);
        } else if (user.role === 'CONSULTA') {
          this.router.navigate(['/consultant/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales inválidas. Por favor intente nuevamente.');
        console.error('Login error:', err);
      }
    });
  }
}
