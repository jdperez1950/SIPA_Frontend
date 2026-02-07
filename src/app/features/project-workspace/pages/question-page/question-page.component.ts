import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QuestionManagerService } from '../../services/question-manager.service';
import { QuestionDefinition } from '../../../../core/models/question.models';
import { DynamicInputComponent } from './components/dynamic-input/dynamic-input.component';
import { EvidenceUploaderComponent } from '../../components/evidence-uploader/evidence-uploader.component';

@Component({
  selector: 'app-question-page',
  standalone: true,
  imports: [CommonModule, DynamicInputComponent, EvidenceUploaderComponent],
  template: `
    @if (currentQuestion(); as question) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <!-- Question Header -->
        <div class="p-8 pb-6">
          <div class="flex items-center gap-3 mb-4">
            <span [class]="getAxisColorText(question.axisId)" class="font-bold text-sm uppercase tracking-wider bg-opacity-10 px-3 py-1 rounded-full bg-gray-100">
              Eje {{ question.axisId }}
            </span>
            <span class="text-gray-300 text-sm">|</span>
            <span class="text-gray-500 text-sm font-medium">Pregunta {{ question.order }}</span>
          </div>
          
          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 mt-1">
               <div [class]="getAxisBgClass(question.axisId)" class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                 {{ question.order }}
               </div>
            </div>
            
            <div class="flex-1">
              <h2 class="text-xl font-medium text-gray-800 leading-relaxed">
                {{ question.text }}
              </h2>
              @if (question.helpText) {
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <p class="italic">{{ question.helpText }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Dynamic Input Area -->
        <div class="px-8 py-6 bg-gray-50 border-y border-gray-100">
           <div class="max-w-3xl ml-16">
              <div class="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <app-dynamic-input 
                  [question]="question"
                  [initialValue]="getCurrentValue(question.id)"
                  (valueChange)="onValueChange(question.id, $event)"
                ></app-dynamic-input>
              </div>
           </div>
        </div>
        
        <!-- Status & Feedback Widget (Based on mockup) -->
        <div class="px-8 py-6 flex items-center justify-between ml-16 mr-8 border-b border-gray-100">
           <div class="flex items-center gap-4">
             <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <div class="w-6 h-6 bg-white rounded-full animate-pulse"></div>
             </div>
             <div>
               <div class="text-3xl font-light text-gray-400">En proceso</div>
               <div class="text-sm text-gray-500 italic">Conoce el requisito y lo está gestionando</div>
             </div>
           </div>
           
           <div class="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-bold text-lg uppercase tracking-wide cursor-not-allowed">
             Sin validar
           </div>
        </div>

        <!-- Evidence Section -->
        @if (question.requiresEvidence) {
          <div class="px-8 py-8 ml-16">
            <h3 class="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Evidencia requerida</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
               <div class="md:col-span-5">
                 <div class="font-medium text-gray-800">Soporte documental</div>
                 <div class="text-sm text-gray-500 mt-1">Documento o soporte técnico que acredite la respuesta seleccionada.</div>
               </div>
               
               <div class="md:col-span-4 flex flex-col gap-2">
                 <!-- Evidence Uploader Component -->
                 <app-evidence-uploader
                   [config]="question.evidenceConfig"
                   (upload)="onEvidenceUpload(question.id, $event)"
                 ></app-evidence-uploader>
               </div>
               
               <div class="md:col-span-3 flex items-center justify-center">
                 @if (getCurrentValue(question.id)?.evidence) {
                   <div class="text-green-600 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                     </svg>
                     <span class="text-sm font-medium">Cargado</span>
                   </div>
                 }
               </div>
            </div>
          </div>
        }

        <!-- Navigation Buttons -->
        <div class="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between">
           <button 
             type="button"
             (click)="prevQuestion(question.id)"
             [disabled]="!questionManager.getPreviousQuestionId(question.id)"
             class="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg"
           >
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
             </svg>
             Anterior
           </button>
           
           <button 
             type="button"
             (click)="nextQuestion(question.id)"
             [disabled]="!questionManager.getNextQuestionId(question.id)"
             class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
           >
             Siguiente
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
             </svg>
           </button>
        </div>
      </div>
    } @else {
      <div class="flex flex-col items-center justify-center h-64 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Pregunta no encontrada</h3>
        <p class="text-gray-500 mt-2">Seleccione una pregunta del menú superior.</p>
      </div>
    }
  `
})
export class QuestionPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  questionManager = inject(QuestionManagerService);

  // Reactive current question based on route param
  currentQuestion = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      map(id => id ? this.questionManager.getQuestion(id) : undefined)
    )
  );

  getAxisColorText(axisId: string): string {
    switch (axisId) {
      case 'SOCIAL': return 'text-blue-600';
      case 'FINANCIERO': return 'text-green-600';
      case 'TECNICO': return 'text-purple-600';
      case 'JURIDICO': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getAxisBgClass(axisId: string): string {
    switch (axisId) {
      case 'SOCIAL': return 'bg-blue-500';
      case 'FINANCIERO': return 'bg-green-600';
      case 'TECNICO': return 'bg-purple-600';
      case 'JURIDICO': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  }

  getCurrentValue(questionId: string): any {
     const resp = this.questionManager.getResponse(questionId);
     return resp ? resp.value : null;
   }

   getEvaluationStatus(questionId: string) {
     const resp = this.questionManager.getResponse(questionId);
     return resp?.evaluationStatus;
   }
 
   onValueChange(questionId: string, value: any) {
    // Construct partial response
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value,
      evidence: existing?.evidence,
      evaluationStatus: existing?.evaluationStatus || 'PENDING',
      lastUpdated: new Date().toISOString()
    });
  }

  onEvidenceUpload(questionId: string, file: File) {
    // console.log(`Uploading file for question ${questionId}:`, file.name); // REMOVED FOR SECURITY (A02)
    // Mock upload logic - would be replaced by actual service call
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value: existing?.value,
      evidence: {
        fileUrl: 'mock-url/' + file.name,
        fileName: file.name,
        uploadDate: new Date().toISOString()
      },
      evaluationStatus: 'PENDING',
      lastUpdated: new Date().toISOString()
    });
  }

  nextQuestion(currentId: string) {
    const nextId = this.questionManager.getNextQuestionId(currentId);
    if (nextId) {
      this.router.navigate(['../../question', nextId], { relativeTo: this.route });
    }
  }

  prevQuestion(currentId: string) {
    const prevId = this.questionManager.getPreviousQuestionId(currentId);
    if (prevId) {
      this.router.navigate(['../../question', prevId], { relativeTo: this.route });
    }
  }
}
