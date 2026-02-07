import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-gray-100" role="main" aria-label="Dashboard principal">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-pavis-primary mb-4">Bienvenido al Dashboard</h1>
        <p class="text-gray-600">Has iniciado sesión correctamente.</p>
      </div>
    </main>
  `,
  styles: []
})
export class DashboardPageComponent {}
