import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { QuestionManagerService } from '../../../services/question-manager.service';

@Component({
  selector: 'app-question-ribbon',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="flex flex-wrap gap-1" aria-label="Navegación de preguntas">
      @for (q of questionManager.activeQuestions(); track q.id) {
        <a 
          [routerLink]="['/workspace/question', q.id]"
          routerLinkActive="ring-2 ring-offset-1 ring-gray-400 font-bold scale-105 shadow-md"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null"
          [class]="getAxisColorClass(q.axisId)"
          class="w-10 h-10 flex items-center justify-center text-white text-sm font-medium rounded hover:opacity-90 transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          [attr.aria-label]="'Pregunta ' + q.order + ', Eje ' + q.axisId"
          [title]="'Eje: ' + q.axisId"
        >
          {{ q.order }}
        </a>
      }
    </nav>
  `
})
export class QuestionRibbonComponent {
  questionManager = inject(QuestionManagerService);

  getAxisColorClass(axisId: string): string {
    switch (axisId) {
      case 'SOCIAL': return 'bg-blue-500';
      case 'FINANCIERO': return 'bg-green-600';
      case 'TECNICO': return 'bg-purple-600';
      case 'JURIDICO': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  }
}
