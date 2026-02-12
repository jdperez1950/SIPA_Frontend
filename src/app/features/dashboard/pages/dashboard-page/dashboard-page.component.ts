import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-gray-100" role="main" aria-label="Dashboard principal">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-pavis-primary mb-4">Bienvenido al Dashboard</h1>
        <p class="text-gray-600 mb-8">Has iniciado sesión correctamente.</p>
        
        <button 
          (click)="logout()" 
          class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <span class="material-symbols-rounded">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </main>
  `,
  styles: []
})
export class DashboardPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
