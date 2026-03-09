import { Injectable, signal, computed } from '@angular/core';
import { QuestionDefinition, QuestionResponse, QuestionDependency } from '../../../core/models/question.models';
import { QuestionService } from '../../../core/services/question.service';
import { QuestionMapperService } from '../../../core/services/question-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionManagerService {
  private questions = signal<QuestionDefinition[]>([]);
  private responses = signal<Map<string, QuestionResponse>>(new Map());
  
  readonly allQuestions = this.questions.asReadonly();
  
  readonly activeQuestions = computed(() => {
    const all = this.questions();
    const responses = this.responses();
    
    return all.filter(q => this.evaluateDependencies(q, responses));
  });

  readonly progress = computed(() => {
    const active = this.activeQuestions();
    const responses = this.responses();
    if (active.length === 0) return 0;
    
    const answeredCount = active.filter(q => {
      const resp = responses.get(q.id);
      return resp && resp.value !== null && resp.value !== undefined && resp.value !== '';
    }).length;
    
    return Math.round((answeredCount / active.length) * 100);
  });

  constructor(
    private questionService: QuestionService,
    private questionMapper: QuestionMapperService
  ) {
    this.responses.update(map => {
      const newMap = new Map(map);
      
      newMap.set('q1', {
        questionId: 'q1',
        value: 'SI',
        lastUpdated: new Date().toISOString(),
        evaluationStatus: 'IN_PROCESS',
        assistanceLog: [
          {
            id: 'log1',
            date: '2025-12-15',
            advisorName: 'ID 12345',
            advisorMessage: 'La oficina de planeación municipal o distrital o la dependencia que haga sus veces aprobó el proyecto de plan parcial, mediante acto administrativo u ocurrió el silencio administrativo.',
            priority: 'IMPORTANT',
            validityPeriod: 'Pv'
          },
          {
            id: 'log2',
            date: '2025-12-05',
            advisorName: 'ID 67890',
            advisorMessage: 'Se requiere adjuntar el certificado de libertad y tradición actualizado.',
            priority: 'URGENT',
            validityPeriod: 'Pv',
            response: {
              responderName: 'Responsable Proyecto',
              responseDate: '2025-12-10',
              message: 'Adjunto el certificado solicitado en la sección de evidencias.'
            }
          }
        ]
      });
      
      return newMap;
    });
  }

  private evaluateDependencies(question: QuestionDefinition, responses: Map<string, QuestionResponse>): boolean {
    if (!question.dependencies || question.dependencies.length === 0) {
      return true;
    }
    
    for (const dep of question.dependencies) {
      const parentResponse = responses.get(dep.dependentOnQuestionId);
      const parentValue = parentResponse?.value;
      
      const match = parentValue === dep.triggerValue;
      
      if (dep.action === 'SHOW' && !match) return false;
      if (dep.action === 'HIDE' && match) return false;
    }
    
    return true;
  }

  async loadQuestions(projectId: string): Promise<void> {
    try {
      const response = await this.questionService
        .getQuestionsByProject(projectId)
        .toPromise();

      if (!response || (!response.success && !Array.isArray(response.data))) {
        throw new Error('Error loading questions');
      }

      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];

      const frontendQuestions = data.map((answer: any) =>
        this.questionMapper.mapBackendToFrontend(answer.question)
      );

      this.questions.set(frontendQuestions);

      data.forEach((answer: any) => {
        if (answer.currentAnswer) {
          const frontendResponse = this.questionMapper.mapBackendResponse(answer);
          this.responses.update(map => {
            const newMap = new Map(map);
            newMap.set(answer.question.id, frontendResponse);
            return newMap;
          });
        }
      });
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }

  getQuestion(id: string): QuestionDefinition | undefined {
    return this.questions().find(q => q.id === id);
  }

  getResponse(questionId: string): QuestionResponse | undefined {
    return this.responses().get(questionId);
  }

  saveResponse(response: QuestionResponse) {
    this.responses.update(map => {
      const newMap = new Map(map);
      newMap.set(response.questionId, response);
      return newMap;
    });
  }

  async submitResponse(
    response: QuestionResponse,
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const backendRequest = this.questionMapper.mapFrontendToBackend(
        response,
        projectId
      );

      const result = await this.questionService
        .saveAnswer(backendRequest)
        .toPromise();

      if (!result?.success) {
        const errorMessage = result?.message || 'Error saving answer';
        throw new Error(errorMessage);
      }

      this.saveResponse({
        ...response,
        lastUpdated: new Date().toISOString(),
        isUnsaved: false
      });

      return {
        success: true,
        message: result?.message || 'Respuesta guardada exitosamente'
      };
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  getNextQuestionId(currentId: string): string | null {
    const active = this.activeQuestions();
    const currentIndex = active.findIndex(q => q.id === currentId);
    
    if (currentIndex >= 0 && currentIndex < active.length - 1) {
      return active[currentIndex + 1].id;
    }
    return null;
  }

  getPreviousQuestionId(currentId: string): string | null {
    const active = this.activeQuestions();
    const currentIndex = active.findIndex(q => q.id === currentId);
    
    if (currentIndex > 0) {
      return active[currentIndex - 1].id;
    }
    return null;
  }
}
