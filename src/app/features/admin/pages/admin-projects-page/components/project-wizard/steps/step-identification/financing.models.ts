export interface FinanciacionFuente {
  fuente: {
    id: string;
    nombre?: string;
  };
  dinero: number;
  especie: number;
}

export interface DetalleFinanciacion {
  tieneDetalleFinanciacion: boolean;
  aportesPorFuente: FinanciacionFuente[];
}
