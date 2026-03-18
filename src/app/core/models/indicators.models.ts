export type IndicatorResponseType = 'CONVOCATORIA' | 'PROYECTO' | 'EJE' | 'PREGUNTA';

export type IndicatorDrawType = 'vertical' | 'horizontal' | 'legend';

export type IndicatorNameType = 'Estado de preguntas' | 'Preguntas Validadas' | 'Prioridad';

export interface IndicatorDataItem {
  indicator: string;
  value: number;
  percentaje: number;
  color: string;
}

export interface Indicator {
  name: IndicatorNameType;
  draw: IndicatorDrawType;
  data: IndicatorDataItem[];
}

export interface IndicatorEntity {
  code: string;
  name: string;
  id: string;
  type: IndicatorResponseType;
  indicators: Indicator[];
}

export type IndicatorsResponse = IndicatorEntity[];

export interface IndicatorsQueryParams {
  callId?: string;
  projectId?: string;
  axisId?: string;
}
