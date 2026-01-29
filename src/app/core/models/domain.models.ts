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
export type UserRole = 'ADMIN' | 'ASESOR' | 'SPAT' | 'CONSULTA';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: UserStatus;
  avatarColor?: string;
  // Specific fields for Advisors/SPAT
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

export interface ProjectProgress {
  technical: number;
  legal: number;
  financial: number;
  social: number;
}

export interface Project {
  id: string;
  code: string;
  organization: string;
  municipality: string;
  state: string;
  status: ProjectStatus;
  viabilityStatus: ViabilityScenario;
  advisor?: ProjectAdvisor;
  progress: ProjectProgress;
}

export interface CreateProjectDTO {
  organization: string;
  municipality: string;
  state: string;
  status: ProjectStatus;
  viabilityStatus: ViabilityScenario;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  id: string;
  advisorId?: string;
}

// Organization Models
export type OrganizationType = 'COMPANY' | 'PERSON';
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
