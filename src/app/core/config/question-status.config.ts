export type QuestionResponseStatus = 'VALIDATED' | 'RETURNED' | 'IN_PROCESS' | 'PENDING';

export interface QuestionStatusConfig {
  icon: string;
  label: string;
}

export const QUESTION_STATUS_CONFIG: Record<QuestionResponseStatus, QuestionStatusConfig> = {
  VALIDATED: {
    icon: 'check',
    label: 'Validado'
  },
  RETURNED: {
    icon: 'warning',
    label: 'Requiere ajustes'
  },
  IN_PROCESS: {
    icon: 'sync',
    label: 'En proceso'
  },
  PENDING: {
    icon: 'check',
    label: 'Respondido - Pendiente de validación'
  }
};

export const QUESTION_STATUS_ORDER: QuestionResponseStatus[] = ['VALIDATED', 'RETURNED', 'IN_PROCESS', 'PENDING'];

export const getQuestionStatusConfig = (status: QuestionResponseStatus | null): QuestionStatusConfig | null => {
  if (!status) {
    return null;
  }
  return QUESTION_STATUS_CONFIG[status] || null;
};
