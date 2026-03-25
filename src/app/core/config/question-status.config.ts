export type QuestionResponseStatus = 'Validadas' | 'Devueltas' | 'Sin responder' | 'Sin validar';

export interface QuestionStatusConfig {
  icon: string;
  label: string;
}

export const QUESTION_STATUS_CONFIG: Record<QuestionResponseStatus, QuestionStatusConfig> = {
  'Validadas': {
    icon: 'check',
    label: 'Validadas'
  },
  'Devueltas': {
    icon: 'warning',
    label: 'Requiere ajustes'
  },
  'Sin responder': {
    icon: 'check',
    label: 'Sin responder'
  },
  'Sin validar': {
    icon: 'clock',
    label: 'En proceso de validación'
  }
};

export const QUESTION_STATUS_ORDER: QuestionResponseStatus[] = ['Validadas', 'Devueltas', 'Sin responder', 'Sin validar'];

export const getQuestionStatusConfig = (status: QuestionResponseStatus | null): QuestionStatusConfig | null => {
  if (!status) {
    return null;
  }
  return QUESTION_STATUS_CONFIG[status] || null;
};
