import { Injectable, signal, computed } from '@angular/core';
import { QuestionDefinition, QuestionResponse } from '../../../core/models/question.models';
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
  ) {}

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

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error('Error loading questions');
      }

      const data = response.data;

      const frontendQuestions = data.map(answer =>
        this.questionMapper.mapBackendToFrontend(answer.question)
      );

      this.questions.set(frontendQuestions);
      this.responses.set(new Map());

      data.forEach(answer => {
        if (this.hasPersistedData(answer)) {
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

  getFirstQuestionId(): string | null {
    return this.questions()[0]?.id || null;
  }

  saveResponse(response: QuestionResponse) {
    this.responses.update(map => {
      const newMap = new Map(map);
      const existing = newMap.get(response.questionId);
      newMap.set(response.questionId, {
        ...existing,
        ...response
      });
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
        answerId: result.data?.id || response.answerId,
        lastUpdated: new Date().toISOString(),
        isUnsaved: false
      });

      return {
        success: true,
        message: result?.message || 'Respuesta guardada exitosamente'
      };
    } catch (error: any) {
      console.error('Error submitting response:', error);
      
      let errorMessage = 'Error al guardar la respuesta';
      
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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

  private hasPersistedData(answer: any): boolean {
    return !!(
      answer.currentAnswer ||
      (answer.evidences && answer.evidences.length > 0) ||
      answer.organizationMessage
    );
  }
}
