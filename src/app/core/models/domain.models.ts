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
