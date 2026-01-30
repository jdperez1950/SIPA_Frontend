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
  organizationId: string;
  organizationName: string;
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
  userId: string;
  userName: string;
  userEmail: string;
}
