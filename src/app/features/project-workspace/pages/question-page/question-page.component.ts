import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { QuestionManagerService } from '../../services/question-manager.service';
import { ProjectContextService } from '../../services/project-context.service';
import { AssistanceLogEntry, EvidenceUpload, QuestionDefinition, QuestionDocumentRequirement } from '../../../../core/models/question.models';
import { DynamicInputComponent } from './components/dynamic-input/dynamic-input.component';
import { EvidenceUploaderComponent } from '../../components/evidence-uploader/evidence-uploader.component';
import { FormsModule } from '@angular/forms';
import { TechnicalAssistanceLogComponent } from '../../components/technical-assistance-log/technical-assistance-log.component';
import { TechnicalAssistanceRegisterComponent } from '../../components/technical-assistance-register/technical-assistance-register.component';
import { LoadingService } from '../../../../core/services/loading.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { AlertService } from '../../../../core/services/alert.service';
import { getAxisColorByName, AXIS_COLORS } from '../../../../core/config/axis-colors.config';
import { QuestionService } from '../../../../core/services/question.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserRole } from '../../../../core/models/domain.models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-question-page',
  standalone: true,
  imports: [CommonModule, DynamicInputComponent, EvidenceUploaderComponent, TechnicalAssistanceLogComponent, TechnicalAssistanceRegisterComponent, FormsModule],
  templateUrl: './question-page.component.html'
})
export class QuestionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  questionManager = inject(QuestionManagerService);
  private projectContextService = inject(ProjectContextService);
  private questionService = inject(QuestionService);
  private loadingService = inject(LoadingService);
  private projectsService = inject(ProjectsService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isAdvisor = computed(() => this.currentUser()?.role === 'ASESOR');
  isOrganization = computed(() => this.currentUser()?.role === 'ORGANIZACION');

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
  axisColors = AXIS_COLORS;
  private editingRequirements = signal<Set<string>>(new Set());

  async ngOnInit() {
    const pid = this.projectId();
    if (pid) {
      try {
        this.isLoading.set(true);
        this.loadingService.show('Cargando preguntas...');
        
        const response = await this.projectsService.getProjectById(pid).toPromise();
        if (response?.data) {
          this.projectContextService.setProject(response.data);
        }
        
        await this.questionManager.loadQuestions(pid);

        const qid = this.currentQuestionId();
        if (!qid) {
          const firstQuestionId = this.questionManager.getFirstQuestionId();
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
        assistanceLog: updatedLog,
        isUnsaved: true
      });
    }
  }

  async onRegisterAssistance(event: { message: string, priority: string }) {
    const qid = this.currentQuestion()?.id;
    if (!qid) return;

    try {
      this.loadingService.show('Guardando nota de asistencia...');
      
      const response = this.questionManager.getResponse(qid);
      
      const newEntry: AssistanceLogEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        advisorName: this.currentUser()?.name || 'Asesor',
        advisorMessage: event.message,
        priority: event.priority as 'Importante' | 'Alerta' | 'Urgente',
        validityPeriod: 'Pv' 
      };

      const updatedResponse: any = {
        ...response,
        questionId: qid,
        evaluatorObservation: event.message, 
        priority: event.priority,
        assistanceLog: [newEntry, ...(response?.assistanceLog || [])],
        lastUpdated: new Date().toISOString(),
        isUnsaved: true
      };

      this.questionManager.saveResponse(updatedResponse);

      const result = await this.questionManager.submitResponse(updatedResponse, this.projectId()!);
      
      if (result.success) {
        this.alertService.success('Nota de asistencia registrada exitosamente');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error saving assistance note:', error);
      this.alertService.error(error?.message || 'Error al guardar la nota de asistencia');
    } finally {
      this.loadingService.hide();
    }
  }

  // --- Methods for Template ---

  getEvidenceConfig(question: QuestionDefinition) {
    return question.evidenceConfig;
  }

  downloadEvidence(fileUrl: string, fileName: string) {
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : (fileUrl.startsWith('/api/') ? fileUrl : `${environment.apiUrl}${fileUrl}`);
    console.log('Downloading file with auth:', { originalFileUrl: fileUrl, fullUrl, fileName });
    
    this.loadingService.show('Descargando archivo...');
    
    this.http.get(fullUrl, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.loadingService.hide();
        this.alertService.error('No se pudo descargar el archivo. Por favor, intenta nuevamente.');
      }
    });
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

  hasAnswer(questionId: string): boolean {
    const val = this.getCurrentValue(questionId);
    return val !== null && val !== undefined && val !== '';
  }

  shouldShowEvidence(question: QuestionDefinition): boolean {
    return question.requiresEvidence && this.hasAnswer(question.id);
  }

  getRequiredDocuments(question: QuestionDefinition) {
    const selectedOptionId = this.getCurrentValue(question.id);
    const requirements = question.requiredDocuments || [];

    if (!selectedOptionId) {
      return requirements.filter(req => !req.triggerOptionId);
    }

    return requirements.filter(req =>
      !req.triggerOptionId || req.triggerOptionId === selectedOptionId
    );
  }

  getObservation(questionId: string): string {
    const resp = this.questionManager.getResponse(questionId);
    return resp?.observation || '';
  }

  shouldShowAssistanceLog(questionId: string): boolean {
    const resp = this.questionManager.getResponse(questionId);
    const hasResponse = resp !== null && resp !== undefined && resp.value !== null && resp.value !== undefined && resp.value !== '';
    const hasLogEntries = resp !== null && resp !== undefined && resp.assistanceLog !== undefined && resp.assistanceLog.length > 0;
    
    if (this.isAdvisor()) {
      return hasResponse || hasLogEntries;
    } else {
      return hasLogEntries && hasResponse;
    }
  }

  isObservationEnabled(questionId: string): boolean {
    const val = this.getCurrentValue(questionId);
    return val !== null && val !== undefined && val !== '';
  }

  formatAxisName(axisName: string): string {
    return axisName.charAt(0).toUpperCase() + axisName.slice(1).toLowerCase();
  }

  onValueChange(questionId: string, value: any) {
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value,
      selectedOptionId: value,
      answerId: existing?.answerId,
      evidence: existing?.evidence,
      observation: existing?.observation,
      evaluationStatus: existing?.evaluationStatus || 'Sin responder',
      lastUpdated: new Date().toISOString(),
      isUnsaved: true
    });
  }

  onObservationChange(questionId: string, observation: string) {
    const existing = this.questionManager.getResponse(questionId);
    this.questionManager.saveResponse({
      questionId,
      value: existing?.value,
      selectedOptionId: existing?.selectedOptionId,
      answerId: existing?.answerId,
      evidence: existing?.evidence,
      observation: observation,
      evaluationStatus: existing?.evaluationStatus || 'Sin responder',
      lastUpdated: new Date().toISOString(),
      isUnsaved: true
    });
  }

  async onEvidenceUpload(questionId: string, file: File, requirementId?: string) {
    try {
      this.loadingService.show('Procesando archivo...');

      const pid = this.projectId();
      const existing = this.questionManager.getResponse(questionId);

      if (!pid) {
        throw new Error('No se encontró el proyecto para cargar evidencia');
      }

      if (!existing?.value) {
        this.alertService.warning('Debe seleccionar una respuesta antes de adjuntar evidencia');
        return;
      }

      let answerId = existing.answerId;
      if (!answerId) {
        const queuedEvidence: EvidenceUpload = {
          requirementId: requirementId,
          fileUrl: '',
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          pendingUpload: true,
          localFile: file
        };

        const currentEvidence = existing.evidence || [];
        const evidence = requirementId
          ? [...currentEvidence.filter(item => item.requirementId !== requirementId), queuedEvidence]
          : [...currentEvidence, queuedEvidence];

        this.questionManager.saveResponse({
          ...existing,
          questionId,
          evidence: evidence,
          lastUpdated: new Date().toISOString(),
          isUnsaved: true
        });

        if (requirementId) {
          this.disableEditRequirement(questionId, requirementId);
        }
        this.alertService.info('Archivo listo. Se cargará al guardar con "Enviar y Siguiente"');
        return;
      }

      if (!answerId) {
        throw new Error('No se pudo crear la respuesta para adjuntar evidencia');
      }

      const uploadResult = await this.questionService
        .uploadEvidence(answerId, {
          file,
          questionId,
          documentTypeId: requirementId
        })
        .toPromise();

      if (!uploadResult?.success || !uploadResult.data) {
        throw new Error(uploadResult?.message || 'Error al cargar la evidencia');
      }

      const newEvidence: EvidenceUpload = {
        id: uploadResult.data.id,
        answerId: uploadResult.data.answerId || answerId,
        requirementId: uploadResult.data.documentTypeId || requirementId,
        fileUrl: uploadResult.data.fileUrl || '',
        fileName: uploadResult.data.fileName || file.name,
        uploadDate: uploadResult.data.uploadedAt || new Date().toISOString(),
        pendingUpload: false
      };

      const refreshedResponse = this.questionManager.getResponse(questionId);
      const currentEvidence = refreshedResponse?.evidence || [];
      const evidence = requirementId
        ? [...currentEvidence.filter(item => item.requirementId !== requirementId), newEvidence]
        : [...currentEvidence, newEvidence];

      this.questionManager.saveResponse({
        ...refreshedResponse,
        questionId,
        value: refreshedResponse?.value ?? existing.value,
        selectedOptionId: refreshedResponse?.selectedOptionId ?? existing.selectedOptionId ?? existing.value,
        answerId,
        evidence,
        lastUpdated: new Date().toISOString(),
        isUnsaved: true
      });

      if (requirementId) {
        this.disableEditRequirement(questionId, requirementId);
      }
      this.alertService.success('Evidencia cargada exitosamente');
    } catch (error) {
      console.error('Error uploading evidence:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el archivo';
      this.alertService.error(errorMessage, 4000);
    } finally {
      this.loadingService.hide();
    }
  }

  getAllEvidence(questionId: string): EvidenceUpload[] {
    const response = this.questionManager.getResponse(questionId);
    return response?.evidence || [];
  }

  getEvidenceForRequirement(questionId: string, requirementId: string) {
    return this.getAllEvidence(questionId).filter(e => e.requirementId === requirementId);
  }

  hasEvidenceForRequirement(questionId: string, requirementId: string): boolean {
    return this.getEvidenceForRequirement(questionId, requirementId).length > 0;
  }

  canShowUploader(questionId: string, requirement: QuestionDocumentRequirement): boolean {
    if (requirement.multiple) {
      return true;
    }

    if (!this.hasEvidenceForRequirement(questionId, requirement.id)) {
      return true;
    }

    return this.isEditingRequirement(questionId, requirement.id);
  }

  enableEditRequirement(questionId: string, requirementId: string) {
    this.editingRequirements.update(current => {
      const next = new Set(current);
      next.add(this.getRequirementKey(questionId, requirementId));
      return next;
    });
  }

  disableEditRequirement(questionId: string, requirementId: string) {
    this.editingRequirements.update(current => {
      const next = new Set(current);
      next.delete(this.getRequirementKey(questionId, requirementId));
      return next;
    });
  }

  isEditingRequirement(questionId: string, requirementId: string): boolean {
    return this.editingRequirements().has(this.getRequirementKey(questionId, requirementId));
  }

  formatFileSize(size?: number): string {
    if (!size || size <= 0) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  async removeEvidence(questionId: string, evidence: EvidenceUpload) {
    const existing = this.questionManager.getResponse(questionId);
    if (!existing?.evidence) return;

    try {
      this.loadingService.show('Eliminando evidencia...');

      if (evidence.id) {
        const deleteResult = await this.questionService.deleteEvidence(evidence.id).toPromise();
        if (!deleteResult?.success) {
          throw new Error(deleteResult?.message || 'No fue posible eliminar la evidencia');
        }
      }

      const newEvidence = existing.evidence.filter(e => e.id !== evidence.id && e.fileName !== evidence.fileName);

      this.questionManager.saveResponse({
        ...existing,
        evidence: newEvidence,
        lastUpdated: new Date().toISOString(),
        isUnsaved: true
      });

      this.alertService.success('Evidencia eliminada');
    } catch (error) {
      console.error('Error removing evidence:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la evidencia';
      this.alertService.error(errorMessage, 4000);
    } finally {
      this.loadingService.hide();
    }
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

  private async uploadPendingEvidences(questionId: string, answerId: string) {
    const response = this.questionManager.getResponse(questionId);
    const pendingEvidences = (response?.evidence || []).filter(e => e.pendingUpload && e.localFile);

    for (const pendingEvidence of pendingEvidences) {
      const uploadResult = await this.questionService.uploadEvidence(answerId, {
        file: pendingEvidence.localFile as File,
        questionId,
        documentTypeId: pendingEvidence.requirementId
      }).toPromise();

      if (!uploadResult?.success || !uploadResult.data) {
        throw new Error(uploadResult?.message || `Error al cargar evidencia: ${pendingEvidence.fileName}`);
      }

      const currentResponse = this.questionManager.getResponse(questionId);
      if (!currentResponse) {
        continue;
      }

      const updatedEvidence = (currentResponse.evidence || []).map(item => {
        const isSamePending = item.pendingUpload
          && item.fileName === pendingEvidence.fileName
          && item.uploadDate === pendingEvidence.uploadDate
          && item.requirementId === pendingEvidence.requirementId;

        if (!isSamePending) {
          return item;
        }

        return {
          id: uploadResult.data.id,
          answerId: uploadResult.data.answerId || answerId,
          requirementId: uploadResult.data.documentTypeId || pendingEvidence.requirementId,
          fileUrl: uploadResult.data.fileUrl || '',
          fileName: uploadResult.data.fileName || pendingEvidence.fileName,
          uploadDate: uploadResult.data.uploadedAt || new Date().toISOString(),
          pendingUpload: false
        } as EvidenceUpload;
      });

      this.questionManager.saveResponse({
        ...currentResponse,
        questionId,
        evidence: updatedEvidence,
        lastUpdated: new Date().toISOString()
      });
    }
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
        const result = await this.questionManager.submitResponse(response, pid);
        const savedResponse = this.questionManager.getResponse(questionId);

        if (savedResponse?.answerId) {
          await this.uploadPendingEvidences(questionId, savedResponse.answerId);
        }
        
        this.alertService.success(result.message, 3000);
        this.loadingService.hide();
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.nextQuestion(questionId);
      } catch (error) {
        console.error('Error submitting response:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al guardar la respuesta';
        this.alertService.error(errorMessage, 4000);
        this.loadingService.hide();
      }
    }
  }

  goBackToPanel() {
    this.router.navigateByUrl('/organization/panel');
  }

  private getRequirementKey(questionId: string, requirementId: string): string {
    return `${questionId}::${requirementId}`;
  }
}
