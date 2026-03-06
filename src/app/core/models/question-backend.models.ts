export interface AxisRequestBackend {
  id: string;
  code: string;
  name: string;
}

export interface QuestionOptionResponseBackend {
  id: string;
  questionId: string;
  optionText: string;
  helpText?: string;
  weight?: number;
}

export interface QuestionPreconditionBackend {
  id: string;
  precondition: {
    id: string;
    code: string;
    title: string;
  };
  responseValue?: string;
  requiresEvidence: boolean;
}

export interface QuestionAttachmentBackend {
  id: string;
  documentType: {
    id: string;
    code: string;
    name: string;
  };
  optionResponse?: QuestionOptionResponseBackend;
}

export interface QuestionRequestBackend {
  id: string;
  axis: AxisRequestBackend;
  code: string;
  order: number;
  title: string;
  description?: string;
  helpInstruction?: string;
  limitDate?: string;
  category?: string;
  options: QuestionOptionResponseBackend[];
  preconditions: QuestionPreconditionBackend[];
  attachments: QuestionAttachmentBackend[];
}

export interface AnswerRequestBackend {
  id?: string;
  project: {
    id: string;
    code?: string;
  };
  question: QuestionRequestBackend;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  answeredAt?: string;
  currentAnswer?: QuestionOptionResponseBackend;
  consultantMessage?: string;
  priority?: string;
  validity?: string;
  progressPercentage?: number;
  evaluationState?: string;
  organizationMessage?: string;
}

export interface SaveAnswerRequest {
  project: {
    id: string;
  };
  question: {
    id: string;
  };
  currentAnswer: {
    id: string;
    optionText: string;
  };
}
