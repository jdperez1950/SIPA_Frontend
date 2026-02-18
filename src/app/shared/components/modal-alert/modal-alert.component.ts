import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface ModalAlertData {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
}

@Component({
  selector: 'app-modal-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (data) {
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div 
            class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full"
            [ngClass]="getIconContainerClass()"
          >
            <span class="material-symbols-rounded text-2xl">{{ getIcon() }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold mb-1" [ngClass]="getTitleClass()">
              {{ data.title }}
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              {{ data.message }}
            </p>

            <button 
              (click)="onConfirm()"
              class="px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              [ngClass]="getButtonClass()"
            >
              {{ data.confirmText || 'Aceptar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [``]
})
export class ModalAlertComponent {
  @Input() data: ModalAlertData | null = null;
  @Output() confirm = new EventEmitter<void>();

  getIcon(): string {
    const type = this.data?.type;
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getIconContainerClass(): string {
    const type = this.data?.type;
    switch (type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getTitleClass(): string {
    const type = this.data?.type;
    switch (type) {
      case 'success': return 'text-green-900';
      case 'error': return 'text-red-900';
      case 'warning': return 'text-yellow-900';
      case 'info': return 'text-blue-900';
      default: return 'text-gray-900';
    }
  }

  getButtonClass(): string {
    const type = this.data?.type;
    switch (type) {
      case 'success': return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      case 'error': return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'warning': return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info': return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      default: return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
    }
  }

  onConfirm() {
    this.confirm.emit();
  }
}
