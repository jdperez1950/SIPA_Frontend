import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <div 
        [class]="mode() === 'fullscreen' 
          ? 'fixed inset-0 bg-white/90 backdrop-blur-sm z-[9999] h-screen w-screen' 
          : 'relative w-full h-full min-h-[200px] bg-white/50 py-12'"
        class="flex flex-col items-center justify-center transition-all duration-300"
      >
        <div class="relative flex flex-col items-center">
          <!-- Spinner container -->
          <div class="relative w-20 h-20 mb-4">
            <!-- Background ring -->
            <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <!-- Spinning ring -->
            <div class="absolute inset-0 border-4 border-pavis-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <!-- Icon in center -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-rounded text-pavis-primary text-3xl">home</span>
            </div>
          </div>
          
          <!-- Text -->
          @if (mode() === 'fullscreen') {
            <h3 class="text-lg font-semibold text-gray-800 tracking-tight">
              Cargando PAVIS
            </h3>
          }
          
          @if (currentMessage()) {
            <p class="mt-2 text-sm text-gray-500 animate-pulse">
              {{ currentMessage() }}
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

  mode = input<'fullscreen' | 'embedded'>('fullscreen');
  isLoading = input<boolean | null>(null);
  message = input<string | null>(null);

  shouldShow = computed(() => {
    const local = this.isLoading();
    // If local is provided (not null), use it. Otherwise use service ONLY if mode is fullscreen.
    // If mode is embedded, we usually expect isLoading to be provided, but if not, 
    // we probably shouldn't show global loading in embedded component unless explicitly desired.
    // However, for backward compatibility, if mode is fullscreen (default), we use service.
    
    if (local !== null) {
      return local;
    }
    
    if (this.mode() === 'fullscreen') {
      return this.loadingService.isLoading();
    }
    
    return false;
  });

  currentMessage = computed(() => {
    const local = this.message();
    return local !== null ? local : (this.mode() === 'fullscreen' ? this.loadingService.message() : null);
  });
}
