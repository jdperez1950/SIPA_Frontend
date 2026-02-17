import { Injectable, signal, computed } from '@angular/core';
import { QuestionDefinition, QuestionResponse, QuestionDependency } from '../../../core/models/question.models';
import { MOCK_QUESTIONS } from '../../../core/data/mock/questions.mock';

@Injectable({
  providedIn: 'root'
})
export class QuestionManagerService {
  // State
  private questions = signal<QuestionDefinition[]>([]);
  private responses = signal<Map<string, QuestionResponse>>(new Map());
  
  // Selectors
  readonly allQuestions = this.questions.asReadonly();
  
  // Computed: Active questions based on dependencies
  readonly activeQuestions = computed(() => {
    const all = this.questions();
    const responses = this.responses();
    
    return all.filter(q => this.evaluateDependencies(q, responses));
  });

  // Computed: Progress (answered / active)
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

  constructor() {
    // Mock data for development
    this.loadMockQuestions();
    
    // Initialize some responses with mock data for bitacora testing
    this.responses.update(map => {
      const newMap = new Map(map);
      
      // Mock log for Question 1
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

  /**
   * Evaluates if a question should be shown based on its dependencies
   */
  private evaluateDependencies(question: QuestionDefinition, responses: Map<string, QuestionResponse>): boolean {
    if (!question.dependencies || question.dependencies.length === 0) {
      return true;
    }

    // Default behavior: AND logic (all dependencies must be met to SHOW)
    // If action is HIDE, any match hides it.
    
    for (const dep of question.dependencies) {
      const parentResponse = responses.get(dep.dependentOnQuestionId);
      const parentValue = parentResponse?.value;
      
      const match = parentValue === dep.triggerValue; // Simple equality for now
      
      if (dep.action === 'SHOW' && !match) return false;
      if (dep.action === 'HIDE' && match) return false;
    }
    
    return true;
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

  submitResponse(response: QuestionResponse): void {
    // This is where we would call the backend API to persist the response
    // For now, we just log the data as requested
    console.log('--- ENVIANDO RESPUESTA AL BACKEND ---');
    console.log('Payload:', {
      questionId: response.questionId,
      value: response.value,
      observation: response.observation,
      evidenceCount: response.evidence?.length || 0,
      evidence: response.evidence?.map(e => ({
        requirementId: e.requirementId,
        fileName: e.fileName
      })),
      timestamp: new Date().toISOString()
    });
    console.log('-------------------------------------');
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

  private loadMockQuestions() {
    // Load from external mock file
    this.questions.set(MOCK_QUESTIONS);
  }
}
