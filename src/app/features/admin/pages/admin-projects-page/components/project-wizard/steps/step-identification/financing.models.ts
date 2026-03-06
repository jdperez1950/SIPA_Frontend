export const FUENTES_FINANCIACION = [
  { id: 'fin_gob_nac', fuente: 'Gobierno Nacional' },
  { id: 'fin_gob_dept', fuente: 'Gobierno Departamental' },
  { id: 'fin_gob_mun', fuente: 'Gobierno Municipal' },
  { id: 'fin_comunidad', fuente: 'Comunidad' },
  { id: 'fin_cooperacion', fuente: 'Cooperación otras entidades' },
  { id: 'fin_credito', fuente: 'Crédito' },
  { id: 'fin_otros', fuente: 'Otras' }
] as const;

export type FuenteFinanciacionKey = typeof FUENTES_FINANCIACION[number]['id'];

export interface FinanciacionFuente {
  id: string;
  fuente: string;
  dinero: number;
  especie: number;
}

export interface DetalleFinanciacion {
  tieneDetalleFinanciacion: boolean;
  aportesPorFuente: FinanciacionFuente[];
}
