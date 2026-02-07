import { ErrorHandler, Injectable, Injector, NgZone, isDevMode } from '@angular/core';
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

    // SECURITY (A02/A05): Only log detailed errors in Dev Mode
    if (isDevMode()) {
        console.error('🔥 Global Error Handler:', error);
    }

    let message = 'Ha ocurrido un error inesperado.';
    
    if (error instanceof HttpErrorResponse) {
      // SECURITY (A05): Generic message for server errors, avoid leaking stack traces
      message = 'Error de conexión con el servidor. Por favor intente más tarde.';
      if (isDevMode()) {
          message += ` (${error.statusText})`;
      }
    } else if (error instanceof Error) {
      // Client Error
      message = error.message;
    } else {
        // Unknown error
        message = 'Error desconocido';
    }

    // Run inside NgZone to ensure UI updates
    this.zone.run(() => {
      alertService.error(message, 5000);
    });
  }
}
