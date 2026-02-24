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
  organizationName: string;
  organizationType: 'COMUNITARIA_BASE' | 'CONSEJO_COMUNITARIO' | 'AUTORIDAD_INDIGENA' | 'MOVIMIENTO_SOCIAL' | 'COLECTIVO' | 'ONG' | 'OSD' | 'ASOCIACION_PROFESIONAL' | 'EN_CONFORMACION';
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
  roleInProject: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
  responsiblePosition?: string; // El Representante legal | Un miembro de la junta directiva | Un miembro activo de la organización | Un apoyo o asesor externo
  profileDescription?: string; // Descripción del perfil del responsable
}
