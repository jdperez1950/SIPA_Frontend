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
  SaveAnswerRequest,
  EvidenceResponseBackend
} from '../models/question-backend.models';
import { getAxisColorByName } from '../config/axis-colors.config';
import { environment } from '../../../environments/environment';

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
      requiresEvidence: backendQuestion.requiresEvidence ?? backendQuestion.attachments?.length > 0,
      requiredDocuments: this.mapAttachmentsToRequirements(backendQuestion.attachments),
      dependencies: this.mapPreconditionsToDependencies(backendQuestion.preconditions),
      feedback: this.mapOptionsToFeedback(backendQuestion.options),
      limitDate: backendQuestion.limitDate,
      axisName: backendQuestion.axis.name
    };
  }

  mapBackendResponse(backendAnswer: AnswerRequestBackend): QuestionResponse {
    return {
      id: backendAnswer.id,
      answerId: backendAnswer.id,
      questionId: backendAnswer.question.id,
      value: backendAnswer.currentAnswer?.id,
      selectedOptionId: backendAnswer.currentAnswer?.id,
      observation: backendAnswer.organizationMessage,
      evaluationStatus: this.mapEvaluationState(backendAnswer.state),
      evaluatorObservation: backendAnswer.advisorMessage,
      lastUpdated: backendAnswer.answeredAt || new Date().toISOString(),
      userId: backendAnswer.user?.id,
      userName: backendAnswer.user?.name,
      priority: backendAnswer.priority,
      answerText: backendAnswer.answerText,
      progressPercentage: backendAnswer.progressPercentage,
      evidence: this.mapEvidences(backendAnswer.evidences, backendAnswer.question.attachments)
    };
  }

  mapFrontendToBackend(
    frontendResponse: QuestionResponse,
    projectId: string
  ): SaveAnswerRequest {
    return {
      id: frontendResponse.id,
      project: {
        id: projectId
      },
      question: {
        id: frontendResponse.questionId
      },
      currentAnswer: {
        id: frontendResponse.selectedOptionId || frontendResponse.value
      },
      organizationMessage: frontendResponse.observation,
      advisorMessage: frontendResponse.evaluatorObservation,
      priority: frontendResponse.priority
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
      triggerValue: this.mapPreconditionTriggerValue(pc.precondition.id, pc.responseValue),
      action: 'SHOW'
    }));
  }

  private mapPreconditionTriggerValue(questionId: string, responseValue?: string): string | undefined {
    if (!responseValue) {
      return responseValue;
    }

    const optionMap = this.optionMapCache.get(questionId);
    if (!optionMap) {
      return responseValue;
    }

    for (const [id, label] of optionMap.entries()) {
      if (label === responseValue) {
        return id;
      }
    }

    return responseValue;
  }

  private mapAttachmentsToRequirements(
    attachments: QuestionAttachmentBackend[]
  ): QuestionDocumentRequirement[] {
    return attachments.map(att => ({
      id: att.documentType.id,
      name: att.documentType.name || att.documentType.code,
      description: att.documentType.helpInstruction || `Tipo: ${att.documentType.code}`,
      required: true,
      multiple: false,
      triggerOptionId: att.optionResponse?.id
    }));
  }

  private mapEvidences(
    evidences?: EvidenceResponseBackend[],
    attachments?: QuestionAttachmentBackend[]
  ) {
    if (!evidences?.length) {
      return [];
    }

    const fallbackRequirementIds = (attachments || []).map(att => att.documentType.id);
    let fallbackIndex = 0;

    return evidences.map(evidence => {
      const requirementId = evidence.documentTypeId || fallbackRequirementIds[fallbackIndex];
      if (!evidence.documentTypeId && fallbackIndex < fallbackRequirementIds.length - 1) {
        fallbackIndex += 1;
      }

      const fileUrl = evidence.fileUrl
        ? (evidence.fileUrl.startsWith('http') ? evidence.fileUrl : (evidence.fileUrl.startsWith('/api/') ? evidence.fileUrl : `${environment.apiUrl}${evidence.fileUrl}`))
        : '';

      console.log('🔍 Evidence URL construction:', {
        fileName: evidence.fileName,
        originalFileUrl: evidence.fileUrl,
        finalFileUrl: fileUrl,
        apiUrl: environment.apiUrl
      });

      return {
      id: evidence.id,
      answerId: evidence.answerId,
      requirementId: requirementId,
      fileUrl: fileUrl,
      fileName: evidence.fileName,
      fileSize: evidence.fileSize,
      uploadDate: evidence.uploadedAt
      };
    });
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
