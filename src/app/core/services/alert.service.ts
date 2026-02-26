import { Injectable, signal } from '@angular/core';

export interface Alert {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts = signal<Alert[]>([]);
  private nextId = 0;

  show(type: Alert['type'], message: string, duration = 5000) {
    const id = this.nextId++;
    const alert: Alert = { id, type, message, duration };
    
    this.alerts.update(current => [...current, alert]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration = 3000) {
    this.show('success', message, duration);
  }

  error(message: string, duration = 4000) {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 3000) {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 3000) {
    this.show('info', message, duration);
  }

  remove(id: number) {
    this.alerts.update(current => current.filter(alert => alert.id !== id));
  }
}
