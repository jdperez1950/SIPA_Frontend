import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QuestionManagerService } from '../../services/question-manager.service';
import { AssistanceLogEntry, QuestionDefinition } from '../../../../core/models/question.models';
import { DynamicInputComponent } from './components/dynamic-input/dynamic-input.component';
import { EvidenceUploaderComponent } from '../../components/evidence-uploader/evidence-uploader.component';
import { FormsModule } from '@angular/forms';
import { TechnicalAssistanceLogComponent } from '../../components/technical-assistance-log/technical-assistance-log.component';

@Component({
  selector: 'app-question-page',
  standalone: true,
  imports: [CommonModule, DynamicInputComponent, EvidenceUploaderComponent, TechnicalAssistanceLogComponent, FormsModule],
  templateUrl: './question-page.component.html'
})
export class QuestionPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  questionManager = inject(QuestionManagerService);

  currentQuestionId = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('questionId'); // Parameter name in routes is 'questionId'
        console.log('Route param questionId:', id);
        return id;
      })
    )
  );

  currentQuestion = computed(() => {
    const id = this.currentQuestionId();
    console.log('Computing currentQuestion for ID:', id);
    if (!id) return null;
    const q = this.questionManager.getQuestion(id);
    console.log('Found question:', q);
    return q;
  });

  getAssistanceLog(questionId: string): AssistanceLogEntry[] {
    const response = this.questionManager.getResponse(questionId);
    // console.log(`Getting logs for ${questionId}:`, response?.assistanceLog); // Debug log
    return response?.assistanceLog || [];
  }

  onAssistanceResponse(questionId: string, event: { entryId: string, message: string }) {
    console.log(`Respuesta a bitácora en pregunta ${questionId}:`, event);
    
    // Aquí actualizamos el estado local (optimistic update)
    // En una implementación real, llamaríamos al servicio
    const currentResponse = this.questionManager.getResponse(questionId);
    if (currentResponse && currentResponse.assistanceLog) {
      const updatedLog = currentResponse.assistanceLog.map(entry => {
        if (entry.id === event.entryId) {
          return {
            ...entry,
            response: {
              responderName: 'Usuario Actual', // Tomar del AuthService
              responseDate: new Date().toISOString(),
              message: event.message
            }
          };
        }
        return entry;
      });

      this.questionManager.saveResponse({
        ...currentResponse,
        assistanceLog: updatedLog
      });
    }
  }

  getEvidenceConfig(question: QuestionDefinition) {
    return question.evidenceConfig;
  }

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

  getFeedbackText(question: QuestionDefinition): string | null {
    if (!question.feedback) return null;
    const currentValue = this.getCurrentValue(question.id);
    const match = question.feedback.find(f => f.matchValue === currentValue);
    return match ? match.text : null;
  }

  getObservation(questionId: string): string {
    const resp = this.questionManager.getResponse(questionId);
    return resp?.observation || '';
  }

  isObservationEnabled(questionId: string): boolean {
    // Enable observation only if a response has been selected
    const val = this.getCurrentValue(questionId);
    return val !== null && val !== undefined && val !== '';
  }

  onValueChange(questionId: string, value: any) {
    // Construct partial response
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value,
      evidence: existing?.evidence,
      observation: existing?.observation, // Preserve observation
      evaluationStatus: existing?.evaluationStatus || 'PENDING',
      lastUpdated: new Date().toISOString()
    });
  }

  onObservationChange(questionId: string, observation: string) {
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value: existing?.value,
      evidence: existing?.evidence,
      observation: observation,
      evaluationStatus: existing?.evaluationStatus || 'PENDING',
      lastUpdated: new Date().toISOString()
    });
  }

  onEvidenceUpload(questionId: string, file: File, requirementId?: string) {
    const existing = this.questionManager.getResponse(questionId);
    
    // Create new evidence item
    const newEvidence = {
      requirementId: requirementId,
      fileUrl: 'mock-url/' + file.name,
      fileName: file.name,
      uploadDate: new Date().toISOString()
    };

    // Append to existing evidence array or create new one
    const currentEvidence = existing?.evidence || [];
    
    // If requirementId exists and multiple is false, replace existing
    // Logic to be refined based on requirement config, but for now simple append
    
    this.questionManager.saveResponse({
      questionId,
      value: existing?.value,
      observation: existing?.observation,
      evidence: [...currentEvidence, newEvidence],
      evaluationStatus: 'PENDING',
      lastUpdated: new Date().toISOString()
    });
  }

  getEvidenceForRequirement(questionId: string, requirementId: string) {
    const evidence = this.getCurrentValue(questionId)?.evidence || [];
    // @ts-ignore
    return evidence.filter(e => e.requirementId === requirementId);
  }

  removeEvidence(questionId: string, fileName: string) {
    const existing = this.questionManager.getResponse(questionId);
    if (!existing || !existing.evidence) return;

    const newEvidence = existing.evidence.filter(e => e.fileName !== fileName);

    this.questionManager.saveResponse({
      ...existing,
      evidence: newEvidence,
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

  canSend(questionId: string): boolean {
    const response = this.questionManager.getResponse(questionId);
    // Basic validation: needs a value.
    // If evidence is required, logic could be stricter here.
    return !!response && response.value !== null && response.value !== undefined && response.value !== '';
  }

  sendAndNext(questionId: string) {
    const response = this.questionManager.getResponse(questionId);
    if (response) {
      this.questionManager.submitResponse(response);
      this.nextQuestion(questionId);
    }
  }

  goBackToPanel() {
    this.router.navigateByUrl('/organization/panel');
  }
}
