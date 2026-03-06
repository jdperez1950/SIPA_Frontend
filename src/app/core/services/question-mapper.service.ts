import { Injectable } from '@angular/core';
import {
  QuestionDefinition,
  QuestionDependency,
  QuestionDocumentRequirement,
  QuestionResponse
} from '../models/question.models';
import {
  QuestionRequestBackend,
  AnswerRequestBackend,
  QuestionPreconditionBackend,
  QuestionAttachmentBackend,
  SaveAnswerRequest
} from '../models/question-backend.models';
import { getAxisColorByName } from '../config/axis-colors.config';

@Injectable({
  providedIn: 'root'
})
export class QuestionMapperService {
  private questionCache: Map<string, QuestionRequestBackend> = new Map();
  private optionMapCache: Map<string, Map<string, string>> = new Map();

  mapBackendToFrontend(backendQuestion: QuestionRequestBackend): QuestionDefinition {
    const options = backendQuestion.options.map(opt => ({
      label: opt.optionText,
      value: opt.id,
      helpText: opt.helpText,
      weight: opt.weight
    }));

    this.questionCache.set(backendQuestion.id, backendQuestion);
    this.optionMapCache.set(backendQuestion.id, new Map(
      options.map(opt => [opt.value, opt.label])
    ));

    return {
      id: backendQuestion.id,
      axisId: this.mapAxisNameToId(backendQuestion.axis.name),
      order: backendQuestion.order,
      code: backendQuestion.code,
      text: backendQuestion.title,
      description: backendQuestion.description,
      category: backendQuestion.category,
      helpText: backendQuestion.helpInstruction,
      controlType: this.inferControlType(backendQuestion),
      options: options,
      requiresEvidence: backendQuestion.attachments?.length > 0,
      requiredDocuments: this.mapAttachmentsToRequirements(backendQuestion.attachments),
      dependencies: this.mapPreconditionsToDependencies(backendQuestion.preconditions),
      feedback: this.mapOptionsToFeedback(backendQuestion.options),
      limitDate: backendQuestion.limitDate,
      axisName: backendQuestion.axis.name
    };
  }

  mapBackendResponse(backendAnswer: AnswerRequestBackend): QuestionResponse {
    return {
      questionId: backendAnswer.question.id,
      value: backendAnswer.currentAnswer?.optionText,
      selectedOptionId: backendAnswer.currentAnswer?.id,
      observation: backendAnswer.organizationMessage,
      evaluationStatus: this.mapEvaluationState(backendAnswer.evaluationState),
      evaluatorObservation: backendAnswer.consultantMessage,
      lastUpdated: backendAnswer.answeredAt || new Date().toISOString(),
      userId: backendAnswer.user?.id,
      userName: backendAnswer.user?.name,
      priority: backendAnswer.priority,
      validity: backendAnswer.validity,
      progressPercentage: backendAnswer.progressPercentage
    };
  }

  mapFrontendToBackend(
    frontendResponse: QuestionResponse,
    projectId: string
  ): SaveAnswerRequest {
    const question = this.questionCache.get(frontendResponse.questionId);
    
    return {
      project: {
        id: projectId
      },
      question: {
        id: frontendResponse.questionId
      },
      currentAnswer: {
        id: frontendResponse.selectedOptionId || this.getOptionIdByValue(
          frontendResponse.questionId,
          frontendResponse.value
        ),
        optionText: frontendResponse.value
      }
    };
  }

  private mapAxisNameToId(axisName: string): string {
    const axisColor = getAxisColorByName(axisName);
    return axisColor.name === 'DEFAULT' ? 'OTRO' : axisColor.name;
  }

  private inferControlType(backendQuestion: QuestionRequestBackend): any {
    if (backendQuestion.options.length === 0) {
      return 'TEXT_AREA';
    }
    
    if (backendQuestion.code?.toUpperCase() === 'DATE') {
      return 'DATE';
    }
    
    return backendQuestion.options.length > 2 ? 'SINGLE_SELECT' : 'SINGLE_SELECT';
  }

  private mapPreconditionsToDependencies(
    preconditions: QuestionPreconditionBackend[]
  ): QuestionDependency[] {
    return preconditions.map(pc => ({
      dependentOnQuestionId: pc.precondition.id,
      triggerValue: pc.responseValue,
      action: 'SHOW'
    }));
  }

  private mapAttachmentsToRequirements(
    attachments: QuestionAttachmentBackend[]
  ): QuestionDocumentRequirement[] {
    return attachments.map(att => ({
      id: att.id,
      name: att.documentType.name,
      description: `Tipo: ${att.documentType.code}`,
      required: true,
      multiple: false
    }));
  }

  private mapOptionsToFeedback(backendOptions: any[]): any[] {
    return backendOptions.map(opt => ({
      matchValue: opt.id,
      text: opt.helpText || ''
    })).filter(f => f.text);
  }

  private mapEvaluationState(evaluationState?: string): any {
    if (!evaluationState) return 'PENDING';
    
    const stateMap: Record<string, string> = {
      'VALIDATED': 'VALIDATED',
      'RETURNED': 'RETURNED',
      'IN_PROCESS': 'IN_PROCESS',
      'PENDING': 'PENDING'
    };
    return stateMap[evaluationState] || 'PENDING';
  }

  private getOptionIdByValue(questionId: string, value: any): string {
    const optionMap = this.optionMapCache.get(questionId);
    if (!optionMap) return '';
    
    for (const [id, label] of optionMap.entries()) {
      if (label === value) return id;
    }
    return '';
  }

  getOptionLabelById(questionId: string, optionId: string): string {
    const optionMap = this.optionMapCache.get(questionId);
    return optionMap?.get(optionId) || '';
  }

  clearCache(): void {
    this.questionCache.clear();
    this.optionMapCache.clear();
  }
}
