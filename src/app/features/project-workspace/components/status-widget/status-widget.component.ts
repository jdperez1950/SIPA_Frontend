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
              @case ('Validadas') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case ('Devueltas') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
  status = input<EvaluationStatus | undefined>('Sin responder');

  getStatusLabel(): string {
    switch (this.status()) {
      case 'Validadas': return 'Validadas';
      case 'Devueltas': return 'Devueltas';
      default: return 'Sin responder';
    }
  }

  getStatusDescription(): string {
    switch (this.status()) {
      case 'Validadas': return 'La respuesta cumple con los requisitos.';
      case 'Devueltas': return 'Se requieren correcciones o aclaraciones.';
      default: return 'Aún no se ha enviado respuesta o está en revisión.';
    }
  }

  getStatusColorClass(): string {
    switch (this.status()) {
      case 'Validadas': return 'bg-green-500';
      case 'Devueltas': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.status()) {
      case 'Validadas': return 'bg-green-100 text-green-600';
      case 'Devueltas': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-400';
    }
  }
}
