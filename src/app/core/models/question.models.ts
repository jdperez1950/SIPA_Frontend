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
}

export interface EvidenceConfig {
  maxSizeMb: number;
  allowedFormats: string[];
  requiresExpirationDate: boolean;
}

export interface QuestionDefinition {
  id: string;
  axisId: string; // 'SOCIAL', 'FINANCIERO', etc.
  order: number;
  text: string;
  helpText?: string;
  controlType: QuestionControlType;
  options?: QuestionOption[];
  requiresEvidence: boolean;
  evidenceConfig?: EvidenceConfig;
  dependencies?: QuestionDependency[];
}

export interface EvidenceUpload {
  fileUrl: string;
  fileName: string;
  uploadDate: string;
  expirationDate?: string;
}

export type EvaluationStatus = 'PENDING' | 'VALIDATED' | 'RETURNED' | 'IN_PROCESS';

export interface QuestionResponse {
  questionId: string;
  value: any;
  evidence?: EvidenceUpload;
  evaluationStatus?: EvaluationStatus;
  evaluatorObservation?: string;
  lastUpdated: string;
}
