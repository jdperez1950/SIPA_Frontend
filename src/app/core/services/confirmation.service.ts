import { Injectable, signal } from '@angular/core';

export interface ConfirmationConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  showCancelButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  isOpen = signal(false);
  config = signal<ConfirmationConfig>({
    title: 'Confirmación',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    showCancelButton: true
  });

  private resolveRef: ((value: boolean) => void) | null = null;

  confirm(config: ConfirmationConfig): Promise<boolean> {
    this.config.set({
      ...config,
      showCancelButton: true,
      confirmText: config.confirmText || 'Confirmar',
      cancelText: config.cancelText || 'Cancelar',
      title: config.title || 'Confirmación'
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveRef = resolve;
    });
  }

  alert(config: Omit<ConfirmationConfig, 'showCancelButton' | 'cancelText'>): Promise<boolean> {
    this.config.set({
      ...config,
      showCancelButton: false,
      confirmText: config.confirmText || 'Entendido',
      title: config.title || 'Aviso'
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveRef = resolve;
    });
  }

  onConfirm() {
    this.isOpen.set(false);
    if (this.resolveRef) {
      this.resolveRef(true);
      this.resolveRef = null;
    }
  }

  onCancel() {
    this.isOpen.set(false);
    if (this.resolveRef) {
      this.resolveRef(false);
      this.resolveRef = null;
    }
  }
}
