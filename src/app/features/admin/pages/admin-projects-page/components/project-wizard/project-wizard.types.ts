export interface WizardState {
  currentStep: number;
  projectData: {
    identification: IdentificationData | null;
    evaluationAxes: EvaluationAxis[];
    technicalTable: TechnicalTableAssignment[];
    responseTeam: ResponseTeamMember[];
  };
}

export interface IdentificationData {
  organizationId?: string;
  description: string;
  projectValue: number;
  housingCount: number;
  beneficiariesCount: number;
  tieneTerreno: ParametroSelect | null;
  landDescription: string;
  tieneFinanciacion: ParametroSelect | null;
  financingDescription: string;
  departmentId: ParametroSelect | null;
  departmentName: string;
  municipality: ParametroSelect | null;
  municipalityName: string | null;
  organizationName: string;
  organizationType: ParametroSelect | null;
  organizationIdentifier?: string;
  verificationDigit?: string;
  organizationEmail: string;
  website: string;
  organizationDescription: string;
  organizationAddress: string;
  isLegallyConstituted?: string;
  legalRepresentativeCertificate?: File | null;
  intentionAct?: File | null;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

export interface ParametroSelect {
  id: string;
  nombre: string;
  tipo?: string;
  codigo?: string;
}

export interface EvaluationAxis {
  id: string; // 'SUELO', 'SOCIAL', 'FINANCIERO', 'PRECONSTRUCCION'
  name: string;
  questionCount: number;
  isActive: boolean;
}

export interface TechnicalTableAssignment {
  eje: string;
  consultor: ParametroSelect;
}

export interface ResponseTeamMember {
  userId?: string;
  name: string;
  documentType: ParametroSelect | null;
  documentNumber: string;
  email: string;
  phone: string;
  nombre: string;
  profile: string;
  representativeType: ParametroSelect | null;
}
