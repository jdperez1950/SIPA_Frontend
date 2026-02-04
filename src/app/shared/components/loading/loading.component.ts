import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 bg-white/90 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center transition-all duration-300">
        <div class="relative flex flex-col items-center">
          <!-- Spinner container -->
          <div class="relative w-20 h-20 mb-4">
            <!-- Background ring -->
            <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <!-- Spinning ring -->
            <div class="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <!-- Icon in center -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-rounded text-blue-600 text-3xl">home</span>
            </div>
          </div>
          
          <!-- Text -->
          <h3 class="text-lg font-semibold text-gray-800 tracking-tight">
            Cargando SIPA v2
          </h3>
          @if (loadingService.message()) {
            <p class="mt-2 text-sm text-gray-500 animate-pulse">
              {{ loadingService.message() }}
            </p>
          }
        </div>
      </div>
    }
  `,
  styles: []
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
