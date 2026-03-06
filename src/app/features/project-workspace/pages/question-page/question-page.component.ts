import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QuestionManagerService } from '../../services/question-manager.service';
import { ProjectContextService } from '../../services/project-context.service';
import { AssistanceLogEntry, QuestionDefinition } from '../../../../core/models/question.models';
import { DynamicInputComponent } from './components/dynamic-input/dynamic-input.component';
import { EvidenceUploaderComponent } from '../../components/evidence-uploader/evidence-uploader.component';
import { FormsModule } from '@angular/forms';
import { TechnicalAssistanceLogComponent } from '../../components/technical-assistance-log/technical-assistance-log.component';
import { FileService } from '../../../../core/services/file.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { getAxisColorByName } from '../../../../core/config/axis-colors.config';

@Component({
  selector: 'app-question-page',
  standalone: true,
  imports: [CommonModule, DynamicInputComponent, EvidenceUploaderComponent, TechnicalAssistanceLogComponent, FormsModule],
  templateUrl: './question-page.component.html'
})
export class QuestionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  questionManager = inject(QuestionManagerService);
  private projectContextService = inject(ProjectContextService);
  private fileService = inject(FileService);
  private loadingService = inject(LoadingService);
  private projectsService = inject(ProjectsService);

  currentQuestionId = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('questionId');
        console.log('Route param questionId:', id);
        return id;
      })
    )
  );

  projectId = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('projectId');
        console.log('Route param projectId:', id);
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

  isLoading = signal(false);
  projectName = signal<string>('');

  async ngOnInit() {
    const pid = this.projectId();
    if (pid) {
      try {
        this.isLoading.set(true);
        this.loadingService.show('Cargando preguntas...');
        
        const project = await this.projectsService.getProjectById(pid).toPromise();
        if (project) {
          this.projectContextService.setProject(project);
        }
        
        await this.questionManager.loadQuestions(pid);

        const qid = this.currentQuestionId();
        if (!qid) {
          const firstQuestionId = this.questionManager['questions']()[0]?.id;
          if (firstQuestionId) {
            if (pid) {
              this.router.navigate(['project', pid, 'question', firstQuestionId], { relativeTo: this.route.parent });
            } else {
              this.router.navigate(['question', firstQuestionId], { relativeTo: this.route });
            }
          }
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        this.loadingService.show('Error al cargar las preguntas');
        setTimeout(() => this.loadingService.hide(), 3000);
      } finally {
        this.isLoading.set(false);
        this.loadingService.hide();
      }
    } else {
      console.error('No projectId found in route');
    }
  }

  getAssistanceLog(questionId: string): AssistanceLogEntry[] {
    const response = this.questionManager.getResponse(questionId);
    return response?.assistanceLog || [];
  }

  onAssistanceResponse(questionId: string, event: { entryId: string, message: string }) {
    console.log(`Respuesta a bitácora en pregunta ${questionId}:`, event);
    
    const currentResponse = this.questionManager.getResponse(questionId);
    if (currentResponse && currentResponse.assistanceLog) {
      const updatedLog = currentResponse.assistanceLog.map(entry => {
        if (entry.id === event.entryId) {
          return {
            ...entry,
            response: {
              responderName: 'Usuario Actual',
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

  getAxisColorText(axisName: string): string {
    return getAxisColorByName(axisName).textColor;
  }

  getAxisBgClass(axisName: string): string {
    return getAxisColorByName(axisName).bgColor;
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

  shouldShowAssistanceLog(questionId: string): boolean {
    const resp = this.questionManager.getResponse(questionId);
    const hasResponse = resp !== null && resp !== undefined && resp.value !== null && resp.value !== undefined && resp.value !== '';
    const hasLogEntries = resp !== null && resp !== undefined && resp.assistanceLog !== undefined && resp.assistanceLog.length > 0;
    return hasResponse || hasLogEntries;
  }

  isObservationEnabled(questionId: string): boolean {
    const val = this.getCurrentValue(questionId);
    return val !== null && val !== undefined && val !== '';
  }

  onValueChange(questionId: string, value: any) {
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value,
      evidence: existing?.evidence,
      observation: existing?.observation,
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

  async onEvidenceUpload(questionId: string, file: File, requirementId?: string) {
    try {
      this.loadingService.show('Cargando archivo...');
      
      const uploadResult = await this.fileService.uploadFile(file).toPromise();
      
      if (!uploadResult) {
        throw new Error('Error al cargar el archivo');
      }

      const fileUrl = this.fileService.getFileUrl(uploadResult.fileId);
      
      const existing = this.questionManager.getResponse(questionId);
      const newEvidence = {
        requirementId: requirementId,
        fileUrl: fileUrl,
        fileName: file.name,
        uploadDate: new Date().toISOString()
      };

      const currentEvidence = existing?.evidence || [];
      
      this.questionManager.saveResponse({
        questionId,
        value: existing?.value,
        observation: existing?.observation,
        evidence: [...currentEvidence, newEvidence],
        evaluationStatus: 'PENDING',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error uploading evidence:', error);
      this.loadingService.show('Error al cargar el archivo');
      setTimeout(() => this.loadingService.hide(), 3000);
    } finally {
      this.loadingService.hide();
    }
  }

  getEvidenceForRequirement(questionId: string, requirementId: string) {
    const response = this.questionManager.getResponse(questionId);
    const evidence = response?.evidence || [];
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
    const pid = this.projectId();
    if (nextId) {
      if (pid) {
        this.router.navigate(['project', pid, 'question', nextId], { relativeTo: this.route.parent });
      } else {
        this.router.navigate(['question', nextId], { relativeTo: this.route });
      }
    }
  }

  prevQuestion(currentId: string) {
    const prevId = this.questionManager.getPreviousQuestionId(currentId);
    const pid = this.projectId();
    if (prevId) {
      if (pid) {
        this.router.navigate(['project', pid, 'question', prevId], { relativeTo: this.route.parent });
      } else {
        this.router.navigate(['question', prevId], { relativeTo: this.route });
      }
    }
  }

  canSend(questionId: string): boolean {
    const response = this.questionManager.getResponse(questionId);
    return !!response && response.value !== null && response.value !== undefined && response.value !== '';
  }

  async sendAndNext(questionId: string) {
    const pid = this.projectId();
    if (!pid) {
      console.error('No projectId available for submission');
      return;
    }

    const response = this.questionManager.getResponse(questionId);
    if (response) {
      try {
        this.loadingService.show('Guardando respuesta...');
        await this.questionManager.submitResponse(response, pid);
        this.nextQuestion(questionId);
      } catch (error) {
        console.error('Error submitting response:', error);
        this.loadingService.show('Error al guardar la respuesta');
        setTimeout(() => this.loadingService.hide(), 3000);
      } finally {
        this.loadingService.hide();
      }
    }
  }

  goBackToPanel() {
    this.router.navigateByUrl('/organization/panel');
  }
}
