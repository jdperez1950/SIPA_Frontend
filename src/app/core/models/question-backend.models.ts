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
    helpInstruction?: string | null;
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
  requiresEvidence?: boolean;
  options: QuestionOptionResponseBackend[];
  preconditions: QuestionPreconditionBackend[];
  attachments: QuestionAttachmentBackend[];
}

export interface EvidenceResponseBackend {
  id: string;
  answerId?: string;
  documentTypeId?: string;
  fileName: string;
  fileSize?: number;
  fileUrl?: string;
  uploadedAt: string;
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
  advisorMessage?: string;
  priority?: string;
  answerText?: string;
  progressPercentage?: number;
  state?: string;
  organizationMessage?: string;
  evidences?: EvidenceResponseBackend[];
}

export interface SaveAnswerRequest {
  id?: string;
  project: {
    id: string;
  };
  question: {
    id: string;
  };
  currentAnswer: {
    id: string;
  };
  answerText?: string;
  adviserMessage?: string;
  organizationMessage?: string;
  priority?: string;
  state?: string;
}

export interface EvidenceUploadRequest {
  file: File;
  questionId?: string;
  description?: string;
  documentTypeId?: string;
}
