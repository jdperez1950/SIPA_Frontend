import { FinanciacionFuente } from '../../../../../../core/models/domain.models';

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
  detalleFinanciacion?: FinanciacionFuente[];
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
  legalRepresentativeCertificateFileId?: string; // ID del archivo subido
  intentionAct?: File | null;
  intentionActFileId?: string; // ID del archivo subido
  tradicionLibertadCertificado?: File | null;
  tradicionLibertadCertificadoFileId?: string;
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
  id: string; // GUID del backend
  code?: string;
  name: string;
}

export interface TechnicalTableAssignment {
  eje: string; // GUID del eje
  ejeName?: string; // Nombre del eje (opcional, para mostrar)
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
