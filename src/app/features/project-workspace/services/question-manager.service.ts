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
    // Here we would call the backend API
    // console.log('Response saved:', response); // REMOVED FOR SECURITY (A02)
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
