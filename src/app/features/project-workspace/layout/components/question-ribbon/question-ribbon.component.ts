import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { QuestionManagerService } from '../../../services/question-manager.service';
import { getAxisColorByName } from '../../../../../core/config/axis-colors.config';
import { getQuestionStatusConfig, type QuestionResponseStatus } from '../../../../../core/config/question-status.config';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-question-ribbon',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="flex flex-wrap gap-1" aria-label="Navegación de preguntas">
      @for (q of questionManager.activeQuestions(); track q.id) {
        <a 
          [routerLink]="getQuestionLink(q.id)"
          routerLinkActive="ring-4 ring-offset-2 ring-gray-800 font-bold scale-110 shadow-lg border-2 border-white"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null"
          [ngClass]="[
            getAxisColor(q.axisName || q.axisId).bgColor,
            rla.isActive ? 'opacity-100 z-10' : 'opacity-80 hover:opacity-90'
          ]"
          class="w-10 h-10 flex items-center justify-center text-white text-sm font-medium rounded transition-all cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-800 relative"
          [attr.aria-label]="'Pregunta ' + q.order + ', Eje ' + (q.axisName || q.axisId) + (rla.isActive ? ', Pregunta actual' : '')"
          [title]="getQuestionTooltip(q, rla.isActive)"
        >
          @if (getStatusIcon(q.id)) {
            <span class="material-symbols-rounded text-lg">{{ getStatusIcon(q.id) }}</span>
          } @else {
            <span>{{ q.order }}</span>
          }
          @if (rla.isActive) {
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
          }
        </a>
      }
    </nav>
  `
})
export class QuestionRibbonComponent {
  questionManager = inject(QuestionManagerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  projectId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('projectId'))
    )
  );

  currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  getQuestionLink(questionId: string) {
    const url = this.currentUrl();
    const match = url?.match(/\/project\/([^\/]+)\//);
    const pid = match ? match[1] : null;
    
    if (pid) {
      return ['/workspace/project', pid, 'question', questionId];
    }
    return ['/workspace/question', questionId];
  }

  getAxisColor(axisName: string) {
    return getAxisColorByName(axisName);
  }

  getResponseStatus(questionId: string): QuestionResponseStatus | null {
    const response = this.questionManager.getResponse(questionId);
    
    if (!response) {
      return null;
    }
    
    // Si la respuesta no está guardada, no mostrar estado (volver a número)
    if (response.isUnsaved) {
      return null;
    }
    
    if (response.evaluationStatus) {
      return response.evaluationStatus;
    }
    
    if (response.value !== null && response.value !== undefined && response.value !== '') {
      return 'PENDING';
    }
    
    return null;
  }

  getStatusIcon(questionId: string): string | null {
    const status = this.getResponseStatus(questionId);
    const config = getQuestionStatusConfig(status);
    return config?.icon || null;
  }

  getStatusLabel(status: QuestionResponseStatus | null): string {
    const config = getQuestionStatusConfig(status);
    return config?.label || 'Sin responder';
  }

  getQuestionTooltip(q: any, isActive: boolean): string {
    const status = this.getResponseStatus(q.id);
    const statusText = this.getStatusLabel(status);
    
    return `Eje: ${q.axisName || q.axisId} - Pregunta ${q.order} (${statusText})${isActive ? ' - Pregunta actual' : ''}`;
  }
}
