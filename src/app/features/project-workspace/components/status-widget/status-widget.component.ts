import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationStatus } from '../../../../core/models/question.models';

@Component({
  selector: 'app-status-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between w-full">
       <div class="flex items-center gap-4">
         <div [class]="getStatusColorClass()" class="w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all">
            <!-- Icon based on status -->
            @switch (status()) {
              @case ('VALIDATED') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case ('RETURNED') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              @case ('IN_PROCESS') {
                <div class="w-6 h-6 bg-white rounded-full animate-pulse"></div>
              }
              @default {
                <div class="w-3 h-3 bg-white rounded-full"></div>
              }
            }
         </div>
         <div>
           <div class="text-3xl font-light text-gray-400">{{ getStatusLabel() }}</div>
           <div class="text-sm text-gray-500 italic">{{ getStatusDescription() }}</div>
         </div>
       </div>
       
       <div [class]="getStatusBadgeClass()" class="px-6 py-3 rounded-lg font-bold text-lg uppercase tracking-wide">
         {{ getStatusLabel() }}
       </div>
    </div>
  `
})
export class StatusWidgetComponent {
  status = input<EvaluationStatus | undefined>('PENDING');

  getStatusLabel(): string {
    switch (this.status()) {
      case 'VALIDATED': return 'Validado';
      case 'RETURNED': return 'Devuelto';
      case 'IN_PROCESS': return 'En Proceso';
      default: return 'Pendiente';
    }
  }

  getStatusDescription(): string {
    switch (this.status()) {
      case 'VALIDATED': return 'La respuesta cumple con los requisitos.';
      case 'RETURNED': return 'Se requieren correcciones o aclaraciones.';
      case 'IN_PROCESS': return 'Conoce el requisito y lo está gestionando.';
      default: return 'Aún no se ha enviado respuesta o está en revisión.';
    }
  }

  getStatusColorClass(): string {
    switch (this.status()) {
      case 'VALIDATED': return 'bg-green-500';
      case 'RETURNED': return 'bg-red-500';
      case 'IN_PROCESS': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.status()) {
      case 'VALIDATED': return 'bg-green-100 text-green-600';
      case 'RETURNED': return 'bg-red-100 text-red-600';
      case 'IN_PROCESS': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-400';
    }
  }
}
