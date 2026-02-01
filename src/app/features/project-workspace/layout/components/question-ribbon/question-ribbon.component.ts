import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { QuestionManagerService } from '../../../services/question-manager.service';

@Component({
  selector: 'app-question-ribbon',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-wrap gap-1">
      @for (q of questionManager.activeQuestions(); track q.id) {
        <a 
          [routerLink]="['/workspace/question', q.id]"
          routerLinkActive="ring-2 ring-offset-1 ring-gray-400 font-bold scale-105 shadow-md"
          [class]="getAxisColorClass(q.axisId)"
          class="w-10 h-10 flex items-center justify-center text-white text-sm font-medium rounded hover:opacity-90 transition-all cursor-pointer select-none"
          [title]="'Eje: ' + q.axisId"
        >
          {{ q.order }}
        </a>
      }
    </div>
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
