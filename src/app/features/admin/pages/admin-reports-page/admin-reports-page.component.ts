import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div class="bg-purple-50 p-6 rounded-full mb-6">
        <span class="material-symbols-rounded text-6xl text-purple-500">bar_chart</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
      <p class="text-xl text-gray-500 mb-8">Esta funcionalidad estará disponible próximamente.</p>
      <div class="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full shadow-sm">
        <h3 class="font-medium text-gray-900 mb-2">¿Qué podrás hacer aquí?</h3>
        <ul class="text-left text-sm text-gray-600 space-y-2">
          <li class="flex items-start gap-2">
            <span class="material-symbols-rounded text-green-500 text-lg">check_circle</span>
            <span>Visualizar estadísticas de proyectos</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="material-symbols-rounded text-green-500 text-lg">check_circle</span>
            <span>Generar reportes de gestión</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="material-symbols-rounded text-green-500 text-lg">check_circle</span>
            <span>Exportar datos a Excel/PDF</span>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class AdminReportsPageComponent {}
