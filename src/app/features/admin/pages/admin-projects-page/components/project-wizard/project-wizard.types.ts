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
  projectName: string;
  department: string;
  municipality: string;
  // organizationId: string; // Removed for V2
  organizationName: string;
  organizationType: 'COMPANY' | 'PERSON';
  organizationIdentifier: string;
  organizationEmail: string;
  organizationDescription: string;
  organizationAddress: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

export interface EvaluationAxis {
  id: string; // 'SUELO', 'SOCIAL', 'FINANCIERO', 'PRECONSTRUCCION'
  name: string;
  questionCount: number;
  isActive: boolean;
}

export interface TechnicalTableAssignment {
  axisId: string;
  advisorId: string;
  advisorName: string;
}

export interface ResponseTeamMember {
  userId?: string; // Optional if new user
  userName: string;
  userEmail: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
}
