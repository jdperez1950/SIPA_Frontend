import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      @for (alert of alertService.alerts(); track alert.id) {
        <div 
          class="min-w-[300px] p-4 rounded-lg shadow-xl border-l-4 transform transition-all duration-300 animate-slide-in pointer-events-auto bg-white"
          [ngClass]="{
            'border-green-500 text-gray-800': alert.type === 'success',
            'border-red-500 text-gray-800': alert.type === 'error',
            'border-orange-500 text-gray-800': alert.type === 'warning',
            'border-blue-500 text-gray-800': alert.type === 'info'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded" [ngClass]="{
                'text-green-500': alert.type === 'success',
                'text-red-500': alert.type === 'error',
                'text-orange-500': alert.type === 'warning',
                'text-blue-500': alert.type === 'info'
              }">
                {{ getIcon(alert.type) }}
              </span>
              <p class="text-sm font-medium">{{ alert.message }}</p>
            </div>
            <button (click)="alertService.remove(alert.id)" class="text-gray-400 hover:text-gray-600">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }
  `]
})
export class AlertToastComponent {
  alertService = inject(AlertService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
