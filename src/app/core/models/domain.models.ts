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
  technical: number;
  legal: number;
  financial: number;
  social: number;
}

export interface Project {
  id: string;
  code: string;
  name?: string; // Project Name (e.g., "vivienda el santander")
  organization: string | any; // Supports string (legacy/mock) or object (API)
  organizationName?: string; // API Organization Name
  municipality: string;
  state: string;
  status: ProjectStatus;
  viabilityStatus: ViabilityScenario;
  advisor?: ProjectAdvisor;
  progress: ProjectProgress;
  organizationData?: Organization; // Full organization details (Detail View)
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  correctionDeadline?: string;
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
  email: string;
  municipality: string;
  region: string;
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
  userName: string;
  userEmail: string;
  documentType?: string; // Made optional to match API flexibility
  documentNumber: string;
  phoneNumber?: string; // Made optional
  status?: string;
}

export interface CreateProjectRequest {
  name?: string;
  organization: OrganizationRequest;
  department: string;
  municipality: string;
  dates: DatesRequest;
  responseTeam?: ProjectResponseTeamMember[];
}

export interface TechnicalTableMember {
  axisId: string;
  advisorId: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  status?: ProjectStatus;
  viabilityStatus?: ViabilityScenario;
  advisorId?: string;
  activeAxes?: string[];
  technicalTable?: TechnicalTableMember[];
  responseTeam?: ProjectResponseTeamMember[];
  dates?: DatesRequest;
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
  identifier: string; // RUC or DNI
  email: string;
  status: OrganizationStatus;
  contactName?: string;
  municipality: string;
  region: string;
  description?: string;
  address?: string;
  userId?: string; // Linked user account
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
  email: string;
  municipality: string;
  region: string;
  contactName?: string;
  status: OrganizationStatus;
}
