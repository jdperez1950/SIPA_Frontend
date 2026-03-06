import { ParametroSelect } from "../../features/admin/pages/admin-projects-page/components/project-wizard/project-wizard.types";

export interface LogMessage {
  id: string;
  timestamp: string;
  senderRole: 'ASESOR' | 'USUARIO' | 'SISTEMA';
  content: string;
  priority?: 'URGENTE' | 'ALERTA' | 'NORMAL'; // Mapped to Traffic Light
  evidenceId?: string; // Link to PDF attachment
}

export enum ViabilityScenario {
  ENABLED = 'HABILITADO',
  PRE_ENABLED = 'PRE_HABILITADO',
  HIGH_POSSIBILITY = 'ALTA_POSIBILIDAD',
  NO_POSSIBILITY = 'SIN_POSIBILIDAD'
}

// User Models
export type UserRole = 'ADMIN' | 'ASESOR' | 'SPAT' | 'CONSULTA' | 'ORGANIZACION' | 'USUARIO' | 'SISTEMA';

export const USER_ROLES_CONFIG: { value: UserRole; label: string; class: string; activeClass: string; textClass: string }[] = [
  { 
    value: 'ADMIN', 
    label: 'Administrador', 
    class: 'bg-purple-50 text-purple-700 border-purple-100',
    activeClass: 'bg-purple-600 text-white',
    textClass: 'text-purple-700'
  },
  { 
    value: 'ASESOR', 
    label: 'Asesor', 
    class: 'bg-green-50 text-green-700 border-green-100',
    activeClass: 'bg-green-600 text-white',
    textClass: 'text-green-700'
  },
  { 
    value: 'SPAT', 
    label: 'SPAT', 
    class: 'bg-blue-50 text-blue-700 border-blue-100',
    activeClass: 'bg-blue-600 text-white',
    textClass: 'text-blue-700'
  },
  { 
    value: 'ORGANIZACION', 
    label: 'Organización', 
    class: 'bg-amber-50 text-amber-700 border-amber-100',
    activeClass: 'bg-amber-600 text-white',
    textClass: 'text-amber-700'
  },
  { 
    value: 'USUARIO', 
    label: 'Usuario', 
    class: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    activeClass: 'bg-indigo-600 text-white',
    textClass: 'text-indigo-700'
  },
  { 
    value: 'CONSULTA', 
    label: 'Consulta', 
    class: 'bg-teal-50 text-teal-700 border-teal-100',
    activeClass: 'bg-teal-600 text-white',
    textClass: 'text-teal-700'
  },
  { 
    value: 'SISTEMA', 
    label: 'Sistema', 
    class: 'bg-slate-50 text-slate-700 border-slate-100',
    activeClass: 'bg-slate-600 text-white',
    textClass: 'text-slate-700'
  }
];

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: UserStatus;
  avatarColor?: string;
  projectsAssigned?: number;
  maxProjects?: number;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  maxProjects?: number;
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
  id: string;
}

// Project Models
export type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'CERTIFIED' | 'BENEFICIARY';

export interface ProjectAdvisor {
  id: string;
  name: string;
}

export interface AdvisorCandidate extends ProjectAdvisor {
  workload: number;
  recommended: boolean;
}

export interface ProjectProgress {
  technical?: number;
  legal?: number;
  financial?: number;
  social?: number;
}

export interface Project {
  id: string;
  code: string;
  organizationId?: string; // API response field for organization ID
  name?: string; // Project Name (e.g., "vivienda el santander")
  description?: string; // Full project description
  organization: string | any; // Supports string (legacy/mock) or object (API)
  organizationName?: string; // API Organization Name
  municipality: string;
  state: string;
  status: ProjectStatus;
  viabilityStatus?: ViabilityScenario;
  advisor?: ProjectAdvisor;
  progress?: ProjectProgress;
  organizationData?: Organization; // Full organization details (Detail View) - contains municipality/region as ParametroBase objects
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  correctionDeadline?: string;
  responseTeam?: ProjectResponseTeamMember[];
  housingCount?: number;
  beneficiariesCount?: number;
  projectValue?: number;
  tieneTerreno?: ParametroSelect;
  landDescription?: string;
  tieneFinanciacion?: ParametroSelect;
  financingDescription?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type OrganizationType = 'COMPANY' | 'PERSON';

export interface OrganizationRequest {
  name: string;
  type: OrganizationType;
  identifier: string;
  verificationDigit?: string;
  email: string;
  website?: string;
  municipalityId: string | null;
  regionId: string;
  description?: string;
  address?: string;
}

export interface DatesRequest {
  start: string;
  end: string;
  submissionDeadline: string;
}

export interface ProjectResponseTeamMember {
  userId?: string;
  name: string;
  email: string;
  profile: string;
  documentType: ParametroSelect | null;
  documentNumber: string;
  nombre: string;
  phone: string;
  representativeType: ParametroSelect | null;
}

export interface ProjectTeamMember {
  eje: string;
  consultor: ParametroSelect | null;
}

export interface ProjectRequest {
  id?: string;
  Description?: string;
  HousingCount?: number;
  BeneficiariesCount?: number;
  TieneTerreno?: ParametroSelect | null;
  LandDescription?: string;
  projectValue?: number;
  TieneFinanciacion?: ParametroSelect | null;
  FinancingDescription?: string;
  Organization?: {
    id?: string;
    name?: string;
    type?: ParametroSelect | null;
    identifier?: string;
    digitoVerificacion?: number;
    email?: string;
    paginaWeb?: string;
    region?: ParametroSelect | null;
    municipality?: ParametroSelect | null;
    address?: string;
    description?: string;
    isLegallyConstituted?: string;
    legalRepresentativeCertificateFileId?: string;
    intentionActFileId?: string;
    tradicionLibertadCertificadoFileId?: string;
    organizationTeam?: ProjectResponseTeamMember[];
  };
  projectTeam?: ProjectTeamMember[];
  technicalTable?: TechnicalTableMember[];
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  status?: ProjectStatus;
  viabilityStatus?: ViabilityScenario;
  advisorId?: string;
  activeAxes?: string[];
}

export interface TechnicalTableMember {
  axisId: string;
  advisorId: string;
}

// Deprecated or Legacy DTOs (kept for compatibility if needed, but prefer Requests above)
export interface CreateProjectDTO {
  organization: string;
  municipality: string;
  state: string;
  status: ProjectStatus;
  viabilityStatus: ViabilityScenario;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

// --- New V2 Project Creation Models ---
// (Replaced by Requests above)


// Organization Models
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  identifier: string;
  verificationDigit?: string;
  digitoVerificacion?: number;
  email: string;
  website?: string;
  status: OrganizationStatus;
  contactName?: string;
  municipality: ParametroBase;
  region: ParametroBase;
  description?: string;
  address?: string;
  userId?: string;
}

// Pagination Models
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CreateOrganizationDTO {
  name: string;
  type: OrganizationType;
  identifier: string;
  verificationDigit?: string;
  email: string;
  website?: string;
  municipality: string;
  region: string;
  contactName?: string;
  status: OrganizationStatus;
  municipalityId?: string;
  regionId?: string;
}

export interface ParametroBase {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  padreId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TipoDocumento extends ParametroBase {}
export interface EstadoCivil extends ParametroBase {}
export interface Sexo extends ParametroBase {}
export interface NivelEscolaridad extends ParametroBase {}
export interface TipoPersona extends ParametroBase {}
export interface TipoOrganizacion extends ParametroBase {}
export interface TipoVivienda extends ParametroBase {}
export interface TenenciaVivienda extends ParametroBase {}
export interface TipoSaneamiento extends ParametroBase {}
export interface TipoServicio extends ParametroBase {}
export interface FuenteAgua extends ParametroBase {}
export interface MaterialParedes extends ParametroBase {}
export interface MaterialPisos extends ParametroBase {}
export interface TipoTejado extends ParametroBase {}
export interface TipoCocina extends ParametroBase {}
export interface CombustibleCocina extends ParametroBase {}
export interface DisposicionBasuras extends ParametroBase {}
export interface TipoActividadEconomica extends ParametroBase {}
export interface SituacionLaboral extends ParametroBase {}
export interface RegimenSalud extends ParametroBase {}
export interface TipoTransporte extends ParametroBase {}
export interface TipoRiesgo extends ParametroBase {}
export interface NivelRiesgo extends ParametroBase {}
export interface TipoProblema extends ParametroBase {}
export interface TipoAyuda extends ParametroBase {}
export interface FuenteRecurso extends ParametroBase {}
export interface TipoIngreso extends ParametroBase {}
export interface TipoGasto extends ParametroBase {}
export interface TipoBien extends ParametroBase {}
export interface EstadoBien extends ParametroBase {}
export interface TipoServicioPublico extends ParametroBase {}
export interface EstadoServicioPublico extends ParametroBase {}
export interface TipoVial extends ParametroBase {}
export interface EstadoVial extends ParametroBase {}
export interface TipoTransportePublico extends ParametroBase {}
export interface EstadoTransportePublico extends ParametroBase {}
export interface TipoComunicacion extends ParametroBase {}
export interface EstadoComunicacion extends ParametroBase {}
export interface TipoEducacion extends ParametroBase {}
export interface NivelEducativo extends ParametroBase {}
export interface TipoEstablecimiento extends ParametroBase {}
export interface EstadoEstablecimiento extends ParametroBase {}
export interface TipoSalud extends ParametroBase {}
export interface NivelAtencion extends ParametroBase {}
export interface TipoEstablecimientoSalud extends ParametroBase {}
export interface EstadoEstablecimientoSalud extends ParametroBase {}
export interface TipoRecreacion extends ParametroBase {}
export interface NivelRecreacion extends ParametroBase {}
export interface TipoEstablecimientoRecreacion extends ParametroBase {}
export interface EstadoEstablecimientoRecreacion extends ParametroBase {}
export interface TipoSeguridad extends ParametroBase {}
export interface NivelSeguridad extends ParametroBase {}
export interface TipoEstablecimientoSeguridad extends ParametroBase {}
export interface EstadoEstablecimientoSeguridad extends ParametroBase {}
export interface TipoAdministracionPublica extends ParametroBase {}
export interface NivelAdministracionPublica extends ParametroBase {}
export interface TipoEstablecimientoAdministracionPublica extends ParametroBase {}
export interface EstadoEstablecimientoAdministracionPublica extends ParametroBase {}
export interface TipoMercado extends ParametroBase {}
export interface NivelMercado extends ParametroBase {}
export interface TipoEstablecimientoMercado extends ParametroBase {}
export interface EstadoEstablecimientoMercado extends ParametroBase {}
export interface TipoFinanciero extends ParametroBase {}
export interface NivelFinanciero extends ParametroBase {}
export interface TipoEstablecimientoFinanciero extends ParametroBase {}
export interface EstadoEstablecimientoFinanciero extends ParametroBase {}
export interface TipoReligion extends ParametroBase {}
export interface NivelReligion extends ParametroBase {}
export interface TipoEstablecimientoReligion extends ParametroBase {}
export interface EstadoEstablecimientoReligion extends ParametroBase {}
export interface TipoCultura extends ParametroBase {}
export interface NivelCultura extends ParametroBase {}
export interface TipoEstablecimientoCultura extends ParametroBase {}
export interface EstadoEstablecimientoCultura extends ParametroBase {}
export interface TipoDeporte extends ParametroBase {}
export interface NivelDeporte extends ParametroBase {}
export interface TipoEstablecimientoDeporte extends ParametroBase {}
export interface EstadoEstablecimientoDeporte extends ParametroBase {}
export interface TipoTurismo extends ParametroBase {}
export interface NivelTurismo extends ParametroBase {}
export interface TipoEstablecimientoTurismo extends ParametroBase {}
export interface EstadoEstablecimientoTurismo extends ParametroBase {}
export interface TipoAmbiente extends ParametroBase {}
export interface NivelAmbiente extends ParametroBase {}
export interface TipoEstablecimientoAmbiente extends ParametroBase {}
export interface EstadoEstablecimientoAmbiente extends ParametroBase {}
export interface TipoServicioSocial extends ParametroBase {}
export interface NivelServicioSocial extends ParametroBase {}
export interface TipoEstablecimientoServicioSocial extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocial extends ParametroBase {}
export interface TipoOrganizacionComunitaria extends ParametroBase {}
export interface NivelOrganizacionComunitaria extends ParametroBase {}
export interface TipoEstablecimientoOrganizacionComunitaria extends ParametroBase {}
export interface EstadoEstablecimientoOrganizacionComunitaria extends ParametroBase {}
export interface TipoParticipacionCiudadana extends ParametroBase {}
export interface NivelParticipacionCiudadana extends ParametroBase {}
export interface TipoEstablecimientoParticipacionCiudadana extends ParametroBase {}
export interface EstadoEstablecimientoParticipacionCiudadana extends ParametroBase {}
export interface TipoViviendaSocial extends ParametroBase {}
export interface NivelViviendaSocial extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocial extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocial extends ParametroBase {}
export interface TipoSaludSocial extends ParametroBase {}
export interface NivelSaludSocial extends ParametroBase {}
export interface TipoEstablecimientoSaludSocial extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocial extends ParametroBase {}
export interface TipoEducacionSocial extends ParametroBase {}
export interface NivelEducacionSocial extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocial extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocial extends ParametroBase {}
export interface TipoTrabajoSocial extends ParametroBase {}
export interface NivelTrabajoSocial extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocial extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocial extends ParametroBase {}
export interface TipoSeguridadSocial extends ParametroBase {}
export interface NivelSeguridadSocial extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocial extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocial extends ParametroBase {}
export interface TipoTransporteSocial extends ParametroBase {}
export interface NivelTransporteSocial extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocial extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocial extends ParametroBase {}
export interface TipoComunicacionSocial extends ParametroBase {}
export interface NivelComunicacionSocial extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocial extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocial extends ParametroBase {}
export interface TipoRecreacionSocial extends ParametroBase {}
export interface NivelRecreacionSocial extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocial extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocial extends ParametroBase {}
export interface TipoDeporteSocial extends ParametroBase {}
export interface NivelDeporteSocial extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocial extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocial extends ParametroBase {}
export interface TipoTurismoSocial extends ParametroBase {}
export interface NivelTurismoSocial extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocial extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocial extends ParametroBase {}
export interface TipoAmbienteSocial extends ParametroBase {}
export interface NivelAmbienteSocial extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocial extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocial extends ParametroBase {}
export interface TipoServicioSocialPublico extends ParametroBase {}
export interface NivelServicioSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoServicioSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocialPublico extends ParametroBase {}
export interface TipoViviendaSocialPublico extends ParametroBase {}
export interface NivelViviendaSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocialPublico extends ParametroBase {}
export interface TipoSaludSocialPublico extends ParametroBase {}
export interface NivelSaludSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoSaludSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocialPublico extends ParametroBase {}
export interface TipoEducacionSocialPublico extends ParametroBase {}
export interface NivelEducacionSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocialPublico extends ParametroBase {}
export interface TipoTrabajoSocialPublico extends ParametroBase {}
export interface NivelTrabajoSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocialPublico extends ParametroBase {}
export interface TipoSeguridadSocialPublico extends ParametroBase {}
export interface NivelSeguridadSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocialPublico extends ParametroBase {}
export interface TipoTransporteSocialPublico extends ParametroBase {}
export interface NivelTransporteSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocialPublico extends ParametroBase {}
export interface TipoComunicacionSocialPublico extends ParametroBase {}
export interface NivelComunicacionSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocialPublico extends ParametroBase {}
export interface TipoRecreacionSocialPublico extends ParametroBase {}
export interface NivelRecreacionSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocialPublico extends ParametroBase {}
export interface TipoDeporteSocialPublico extends ParametroBase {}
export interface NivelDeporteSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocialPublico extends ParametroBase {}
export interface TipoTurismoSocialPublico extends ParametroBase {}
export interface NivelTurismoSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocialPublico extends ParametroBase {}
export interface TipoAmbienteSocialPublico extends ParametroBase {}
export interface NivelAmbienteSocialPublico extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocialPublico extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocialPublico extends ParametroBase {}
export interface TipoServicioSocialPrivado extends ParametroBase {}
export interface NivelServicioSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoServicioSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocialPrivado extends ParametroBase {}
export interface TipoViviendaSocialPrivado extends ParametroBase {}
export interface NivelViviendaSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocialPrivado extends ParametroBase {}
export interface TipoSaludSocialPrivado extends ParametroBase {}
export interface NivelSaludSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoSaludSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocialPrivado extends ParametroBase {}
export interface TipoEducacionSocialPrivado extends ParametroBase {}
export interface NivelEducacionSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocialPrivado extends ParametroBase {}
export interface TipoTrabajoSocialPrivado extends ParametroBase {}
export interface NivelTrabajoSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocialPrivado extends ParametroBase {}
export interface TipoSeguridadSocialPrivado extends ParametroBase {}
export interface NivelSeguridadSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocialPrivado extends ParametroBase {}
export interface TipoTransporteSocialPrivado extends ParametroBase {}
export interface NivelTransporteSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocialPrivado extends ParametroBase {}
export interface TipoComunicacionSocialPrivado extends ParametroBase {}
export interface NivelComunicacionSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocialPrivado extends ParametroBase {}
export interface TipoRecreacionSocialPrivado extends ParametroBase {}
export interface NivelRecreacionSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocialPrivado extends ParametroBase {}
export interface TipoDeporteSocialPrivado extends ParametroBase {}
export interface NivelDeporteSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocialPrivado extends ParametroBase {}
export interface TipoTurismoSocialPrivado extends ParametroBase {}
export interface NivelTurismoSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocialPrivado extends ParametroBase {}
export interface TipoAmbienteSocialPrivado extends ParametroBase {}
export interface NivelAmbienteSocialPrivado extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocialPrivado extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocialPrivado extends ParametroBase {}
export interface TipoServicioSocialComunitario extends ParametroBase {}
export interface NivelServicioSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoServicioSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocialComunitario extends ParametroBase {}
export interface TipoViviendaSocialComunitario extends ParametroBase {}
export interface NivelViviendaSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocialComunitario extends ParametroBase {}
export interface TipoSaludSocialComunitario extends ParametroBase {}
export interface NivelSaludSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoSaludSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocialComunitario extends ParametroBase {}
export interface TipoEducacionSocialComunitario extends ParametroBase {}
export interface NivelEducacionSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocialComunitario extends ParametroBase {}
export interface TipoTrabajoSocialComunitario extends ParametroBase {}
export interface NivelTrabajoSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocialComunitario extends ParametroBase {}
export interface TipoSeguridadSocialComunitario extends ParametroBase {}
export interface NivelSeguridadSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocialComunitario extends ParametroBase {}
export interface TipoTransporteSocialComunitario extends ParametroBase {}
export interface NivelTransporteSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocialComunitario extends ParametroBase {}
export interface TipoComunicacionSocialComunitario extends ParametroBase {}
export interface NivelComunicacionSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocialComunitario extends ParametroBase {}
export interface TipoRecreacionSocialComunitario extends ParametroBase {}
export interface NivelRecreacionSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocialComunitario extends ParametroBase {}
export interface TipoDeporteSocialComunitario extends ParametroBase {}
export interface NivelDeporteSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocialComunitario extends ParametroBase {}
export interface TipoTurismoSocialComunitario extends ParametroBase {}
export interface NivelTurismoSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocialComunitario extends ParametroBase {}
export interface TipoAmbienteSocialComunitario extends ParametroBase {}
export interface NivelAmbienteSocialComunitario extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocialComunitario extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocialComunitario extends ParametroBase {}
export interface TipoServicioSocialTercerSector extends ParametroBase {}
export interface NivelServicioSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoServicioSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocialTercerSector extends ParametroBase {}
export interface TipoViviendaSocialTercerSector extends ParametroBase {}
export interface NivelViviendaSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocialTercerSector extends ParametroBase {}
export interface TipoSaludSocialTercerSector extends ParametroBase {}
export interface NivelSaludSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoSaludSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocialTercerSector extends ParametroBase {}
export interface TipoEducacionSocialTercerSector extends ParametroBase {}
export interface NivelEducacionSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocialTercerSector extends ParametroBase {}
export interface TipoTrabajoSocialTercerSector extends ParametroBase {}
export interface NivelTrabajoSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocialTercerSector extends ParametroBase {}
export interface TipoSeguridadSocialTercerSector extends ParametroBase {}
export interface NivelSeguridadSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocialTercerSector extends ParametroBase {}
export interface TipoTransporteSocialTercerSector extends ParametroBase {}
export interface NivelTransporteSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocialTercerSector extends ParametroBase {}
export interface TipoComunicacionSocialTercerSector extends ParametroBase {}
export interface NivelComunicacionSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocialTercerSector extends ParametroBase {}
export interface TipoRecreacionSocialTercerSector extends ParametroBase {}
export interface NivelRecreacionSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocialTercerSector extends ParametroBase {}
export interface TipoDeporteSocialTercerSector extends ParametroBase {}
export interface NivelDeporteSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocialTercerSector extends ParametroBase {}
export interface TipoTurismoSocialTercerSector extends ParametroBase {}
export interface NivelTurismoSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocialTercerSector extends ParametroBase {}
export interface TipoAmbienteSocialTercerSector extends ParametroBase {}
export interface NivelAmbienteSocialTercerSector extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocialTercerSector extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocialTercerSector extends ParametroBase {}
export interface TipoServicioSocialONG extends ParametroBase {}
export interface NivelServicioSocialONG extends ParametroBase {}
export interface TipoEstablecimientoServicioSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoServicioSocialONG extends ParametroBase {}
export interface TipoViviendaSocialONG extends ParametroBase {}
export interface NivelViviendaSocialONG extends ParametroBase {}
export interface TipoEstablecimientoViviendaSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoViviendaSocialONG extends ParametroBase {}
export interface TipoSaludSocialONG extends ParametroBase {}
export interface NivelSaludSocialONG extends ParametroBase {}
export interface TipoEstablecimientoSaludSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoSaludSocialONG extends ParametroBase {}
export interface TipoEducacionSocialONG extends ParametroBase {}
export interface NivelEducacionSocialONG extends ParametroBase {}
export interface TipoEstablecimientoEducacionSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoEducacionSocialONG extends ParametroBase {}
export interface TipoTrabajoSocialONG extends ParametroBase {}
export interface NivelTrabajoSocialONG extends ParametroBase {}
export interface TipoEstablecimientoTrabajoSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoTrabajoSocialONG extends ParametroBase {}
export interface TipoSeguridadSocialONG extends ParametroBase {}
export interface NivelSeguridadSocialONG extends ParametroBase {}
export interface TipoEstablecimientoSeguridadSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoSeguridadSocialONG extends ParametroBase {}
export interface TipoTransporteSocialONG extends ParametroBase {}
export interface NivelTransporteSocialONG extends ParametroBase {}
export interface TipoEstablecimientoTransporteSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoTransporteSocialONG extends ParametroBase {}
export interface TipoComunicacionSocialONG extends ParametroBase {}
export interface NivelComunicacionSocialONG extends ParametroBase {}
export interface TipoEstablecimientoComunicacionSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoComunicacionSocialONG extends ParametroBase {}
export interface TipoRecreacionSocialONG extends ParametroBase {}
export interface NivelRecreacionSocialONG extends ParametroBase {}
export interface TipoEstablecimientoRecreacionSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoRecreacionSocialONG extends ParametroBase {}
export interface TipoDeporteSocialONG extends ParametroBase {}
export interface NivelDeporteSocialONG extends ParametroBase {}
export interface TipoEstablecimientoDeporteSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoDeporteSocialONG extends ParametroBase {}
export interface TipoTurismoSocialONG extends ParametroBase {}
export interface NivelTurismoSocialONG extends ParametroBase {}
export interface TipoEstablecimientoTurismoSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoTurismoSocialONG extends ParametroBase {}
export interface TipoAmbienteSocialONG extends ParametroBase {}
export interface NivelAmbienteSocialONG extends ParametroBase {}
export interface TipoEstablecimientoAmbienteSocialONG extends ParametroBase {}
export interface EstadoEstablecimientoAmbienteSocialONG extends ParametroBase {}
