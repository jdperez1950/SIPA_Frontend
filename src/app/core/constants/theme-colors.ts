/**
 * Sistema de Color SIPA v2
 */

export const SIPA_COLORS = {
  // --- SEMÁFORO DE PRIORIDADES (Bitácora - Pág 9) ---
  priority: {
    urgent: '#D32F2F',       // Rojo: "URGENTE" - Acción inmediata
    alert: '#F57C00',        // Naranja: "ALERTA" - Próximo a vencer
    important: '#1976D2',    // Azul: "IMPORTANTE" - Informativo clave
    normal: '#424242',       // Gris Oscuro: Texto estándar
  },

  // --- ESTADOS DE VALIDACIÓN (Preguntas y Requisitos) ---
  status: {
    validated: '#2E7D32',    // Verde: "VALIDADO" / "Cumple"
    returned: '#C62828',     // Rojo: "DEVUELTA" / "No cumple"
    inProcess: '#0288D1',    // Azul Claro: "EN PROCESO" / "En gestión"
    pending: '#757575',      // Gris: "SIN VALIDAR" (Default)
    unknown: '#9E9E9E',      // Gris Claro: "No aplica"
  },

  // --- ESCENARIOS DE VIABILIDAD (Dashboard Asesor - Pág 10) ---
  viability: {
    enabled: '#43A047',          // Verde Intenso: Habilitado
    preEnabled: '#7CB342',       // Verde Lima: Pre-habilitado
    highPossibility: '#FDD835',  // Amarillo: Alta Posibilidad
    possibility: '#FFB300',      // Ámbar: Con Posibilidad
    noPossibility: '#B0BEC5',    // Gris Azulado: Sin Posibilidad
  },

  // --- MARCA INSTITUCIONAL (MinVivienda) ---
  brand: {
    primary: '#0033A0',   // Azul Institucional
    secondary: '#D92330', // Rojo Institucional
    accent: '#00C3E3',    // Cyan (Detalles UI)
  }
} as const;

// Helper Type para uso en componentes
export type PriorityColor = typeof SIPA_COLORS.priority;
export type StatusColor = typeof SIPA_COLORS.status;
