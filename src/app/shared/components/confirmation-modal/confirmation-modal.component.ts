import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-in">
          <!-- Content -->
          <div class="p-6 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
              [ngClass]="{
                'bg-red-100 text-red-600': type === 'danger',
                'bg-yellow-100 text-yellow-600': type === 'warning',
                'bg-blue-100 text-blue-600': type === 'info'
              }">
              <span class="material-symbols-rounded text-2xl">{{ getIcon() }}</span>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ message }}</p>

            <div class="flex gap-3">
              @if (showCancelButton) {
                <button 
                  (click)="onCancel()"
                  class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {{ cancelText }}
                </button>
              }
              <button 
                (click)="onConfirm()"
                class="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                [ngClass]="{
                  'bg-red-600 hover:bg-red-700 focus:ring-red-500': type === 'danger',
                  'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white': type === 'warning',
                  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': type === 'info'
                }"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';
  @Input() showCancelButton = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getIcon(): string {
    switch (this.type) {
      case 'danger': return 'warning';
      case 'warning': return 'error'; // material symbol for alert is often 'error' or 'warning'
      case 'info': return 'info';
      default: return 'help';
    }
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
