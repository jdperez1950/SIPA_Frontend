import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../services/alert.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private injector: Injector,
    private zone: NgZone
  ) {}

  handleError(error: any): void {
    const alertService = this.injector.get(AlertService);

    // Log the error to the console (or a logging service)
    console.error('🔥 Global Error Handler:', error);

    let message = 'Ha ocurrido un error inesperado.';
    
    if (error instanceof HttpErrorResponse) {
      // Server error
      message = error.error?.message || error.statusText || 'Error de conexión con el servidor.';
    } else if (error instanceof Error) {
      // Client Error
      message = error.message;
    } else {
        // Unknown error
        message = error?.toString() || 'Error desconocido';
    }

    // Run inside NgZone to ensure UI updates
    this.zone.run(() => {
      alertService.error(message, 5000);
    });
  }
}
