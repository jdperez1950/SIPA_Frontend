export type QuestionControlType = 
  | 'TEXT_AREA' 
  | 'SINGLE_SELECT' 
  | 'MULTI_SELECT' 
  | 'DATE' 
  | 'INFO_ONLY';

export interface QuestionDependency {
  dependentOnQuestionId: string;
  triggerValue: any;
  action: 'SHOW' | 'HIDE';
}

export interface QuestionOption {
  label: string;
  value: any;
  helpText?: string;
  weight?: number;
}

export interface EvidenceConfig {
  maxSizeMb: number;
  allowedFormats: string[];
  requiresExpirationDate?: boolean;
}

export interface QuestionDocumentRequirement {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  multiple: boolean;
  triggerOptionId?: string;
}

export interface QuestionDefinition {
  id: string;
  axisId: string;
  order: number;
  code: string;
  text: string;
  description?: string;
  category?: string;
  subcategory?: string;
  helpText?: string;
  controlType: QuestionControlType;
  options?: QuestionOption[];
  requiresEvidence: boolean;
  requiredDocuments?: QuestionDocumentRequirement[];
  evidenceConfig?: EvidenceConfig;
  evidenceText?: string;
  feedback?: { matchValue: any; text: string }[];
  dependencies?: QuestionDependency[];
  limitDate?: string;
  weight?: number;
  axisName?: string;
}

export interface EvidenceUpload {
  id?: string;
  answerId?: string;
  requirementId?: string; // New: ID del requisito específico (opcional para retrocompatibilidad)
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadDate: string;
  expirationDate?: string;
  pendingUpload?: boolean;
  localFile?: File;
}

export interface AssistanceLogEntry {
  id: string;
  date: string;
  advisorName: string;
  advisorMessage: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  validityPeriod: string; // e.g. "Pv" (Periodo Vigente)
  correctionUpdate?: {
    responderName: string;
    responseDate: string;
    message: string;
  };
}

export type EvaluationStatus = 'PENDING' | 'VALIDATED' | 'RETURNED' | 'IN_PROCESS';

export interface QuestionResponse {
  id?: string;
  answerId?: string;
  questionId: string;
  value: any;
  observation?: string;
  evidence?: EvidenceUpload[];
  evaluationStatus?: EvaluationStatus;
  evaluatorObservation?: string;
  assistanceLog?: AssistanceLogEntry[];
  lastUpdated: string;
  selectedOptionId?: string;
  userId?: string;
  userName?: string;
  priority?: string;
  answerText?: string;
  progressPercentage?: number;
  isUnsaved?: boolean;
}
