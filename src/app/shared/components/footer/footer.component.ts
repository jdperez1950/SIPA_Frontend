import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t border-gray-200 mt-auto py-6">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-700">PAVIS</span>
          <span class="text-gray-300">|</span>
          <span>&copy; {{ currentYear }} Todos los derechos reservados.</span>
        </div>
        <div class="flex gap-6">
          <button 
            (click)="openModal('Términos')" 
            class="hover:text-blue-600 transition-colors bg-transparent border-0 cursor-pointer"
            aria-label="Ver términos y condiciones"
          >
            Términos
          </button>
          <button 
            (click)="openModal('Privacidad')" 
            class="hover:text-blue-600 transition-colors bg-transparent border-0 cursor-pointer"
            aria-label="Ver política de privacidad"
          >
            Privacidad
          </button>
          <button 
            (click)="openModal('Soporte')" 
            class="hover:text-blue-600 transition-colors bg-transparent border-0 cursor-pointer"
            aria-label="Contactar soporte"
          >
            Soporte
          </button>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private confirmationService = inject(ConfirmationService);
  
  currentYear = new Date().getFullYear();

  openModal(title: string) {
    this.confirmationService.alert({
      title: title,
      message: `Aquí la entidad colocará la información relacionada con ${title}.`,
      type: 'info',
      confirmText: 'Entendido'
    });
  }
}
