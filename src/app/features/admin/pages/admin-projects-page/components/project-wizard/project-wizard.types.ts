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
  description: string;
  projectBriefDescription: string;
  projectValue: number;
  housingCount: number;
  beneficiariesCount: number;
  tieneTerreno: ParametroSelect;
  landDescription: string;
  tieneFinanciacion: ParametroSelect;
  financingDescription: string;
  departmentId: ParametroSelect;
  departmentName: string;
  municipality: ParametroSelect | null;
  municipalityName: string | null;
  organizationName: string;
  organizationType: ParametroSelect;
  organizationIdentifier: string;
  verificationDigit: string;
  organizationEmail: string;
  website: string;
  organizationDescription: string;
  organizationAddress: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

export interface ParametroSelect {
  id: string;
  nombre: string;
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
  documentType: ParametroSelect;
  documentNumber: string;
  email: string;
  phone: string;
  nombre: string;
  profile: string;
  representativeType: ParametroSelect;
}
