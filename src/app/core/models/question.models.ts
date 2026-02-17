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

export interface QuestionDocumentRequirement {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  multiple: boolean;
}

export interface QuestionDefinition {
  id: string;
  axisId: string; // 'SOCIAL', 'FINANCIERO', etc.
  order: number;
  code: string; // New: 'HAB', etc.
  text: string;
  description?: string; // New: Contexto legal/técnico
  category?: string; // New: "Viabilidad / Norma urbanística"
  subcategory?: string; // New: "Uso de vivienda"
  helpText?: string;
  controlType: QuestionControlType;
  options?: QuestionOption[];
  requiresEvidence: boolean;
  requiredDocuments?: QuestionDocumentRequirement[]; // New: Lista de documentos específicos
  evidenceConfig?: EvidenceConfig;
  evidenceText?: string; // Deprecated in favor of requiredDocuments, kept for backward compat
  feedback?: { matchValue: any; text: string }[]; // New: "Según si respuesta, considere"
  dependencies?: QuestionDependency[];
}

export interface EvidenceUpload {
  requirementId?: string; // New: ID del requisito específico (opcional para retrocompatibilidad)
  fileUrl: string;
  fileName: string;
  uploadDate: string;
  expirationDate?: string;
}

export interface AssistanceLogEntry {
  id: string;
  date: string;
  advisorName: string;
  advisorMessage: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  validityPeriod: string; // e.g. "Pv" (Periodo Vigente)
  response?: {
    responderName: string;
    responseDate: string;
    message: string;
  };
}

export type EvaluationStatus = 'PENDING' | 'VALIDATED' | 'RETURNED' | 'IN_PROCESS';

export interface QuestionResponse {
  questionId: string;
  value: any;
  observation?: string; // New: Campo "Descripción / Observaciones" del usuario
  evidence?: EvidenceUpload[]; // Changed: Array de evidencias
  evaluationStatus?: EvaluationStatus;
  evaluatorObservation?: string;
  assistanceLog?: AssistanceLogEntry[]; // New: Bitácora de asistencia
  lastUpdated: string;
}
