/**
 * Sistema de Color PAVIS - UI Kit Completo
 * Incluye: Marca, Semáforos, Inputs, Botones, Fondos y Gráficos.
 */

export const PAVIS_COLORS = {
  // --- 1. MARCA INSTITUCIONAL ---
  brand: {
    primary: '#0033A0',   // Azul Gobierno (Acción Principal)
    primaryHover: '#002575',
    secondary: '#D92330', // Rojo Gobierno (Acción Secundaria/Destacada)
    secondaryHover: '#B91C26',
    accent: '#00C3E3',    // Cyan (Detalles, Iconos)
  },

  // --- 2. INTERFAZ GENERAL (Fondos y Textos) ---
  ui: {
    background: '#F3F4F6',   // Gris muy claro (Fondo de página / Body)
    surface: '#FFFFFF',      // Blanco (Tarjetas, Modales, Sidebar)
    surfaceAlt: '#F9FAFB',   // Blanco alternativo (Headers de tablas, Footers)
    darkBg: '#111827',       // Negro suave (Tooltips, Modales oscuros)
    border: '#E5E7EB',       // Gris claro (Bordes de tarjetas, Separadores)
    borderStrong: '#D1D5DB', // Gris medio (Bordes de inputs inactivos)
    
    // Tipografía
    textMain: '#111827',     // Negro suave (Títulos, Texto principal)
    textBody: '#374151',     // Gris oscuro (Párrafos)
    textMuted: '#6B7280',    // Gris medio (Meta-data, Placeholders, Disabled)
    textInverted: '#FFFFFF', // Texto sobre fondos oscuros
  },

  // --- 3. ACCIONES (Botones) ---
  action: {
    // Botón Primario (Azul)
    primaryBg: '#0033A0',
    primaryText: '#FFFFFF',
    
    // Botón Secundario (Borde Azul)
    secondaryBg: 'transparent',
    secondaryBorder: '#0033A0',
    secondaryText: '#0033A0',

    // Botón Peligro/Cancelar
    dangerBg: '#FEE2E2',
    dangerText: '#991B1B',
    
    // Estado Deshabilitado
    disabledBg: '#E5E7EB',
    disabledText: '#9CA3AF',
  },

  // --- 4. FORMULARIOS (Inputs, Selects) ---
  form: {
    inputBg: '#FFFFFF',
    inputBorder: '#D1D5DB',
    inputFocusRing: '#0033A0', // Ring de enfoque (Brand Primary)
    inputErrorBorder: '#EF4444',
    inputPlaceholder: '#9CA3AF',
  },

  // --- 5. SEMÁFORO DE NEGOCIO (Estados PAVIS) ---
  status: {
    validated: '#15803D',    // Verde Oscuro (Validado)
    validatedBg: '#DCFCE7',  // Verde Claro (Fondo Badge)
    
    returned: '#B91C1C',     // Rojo Oscuro (Devuelto)
    returnedBg: '#FEE2E2',   // Rojo Claro (Fondo Badge)
    
    process: '#0369A1',      // Azul (En proceso)
    processBg: '#E0F2FE',    // Azul Claro (Fondo Badge)
    
    pending: '#4B5563',      // Gris (Sin validar)
    pendingBg: '#F3F4F6',    // Gris Claro (Fondo Badge)
  },

  // --- 6. PRIORIDADES (Bitácora) ---
  priority: {
    urgent: '#DC2626',       // Rojo Intenso
    alert: '#EA580C',        // Naranja Intenso
    info: '#2563EB',         // Azul Info
  },

  // --- 7. ESCENARIOS DE VIABILIDAD ---
  viability: {
    enabled: '#16A34A',      // Verde Habilitado
    preEnabled: '#84CC16',   // Verde Lima
    high: '#EAB308',         // Amarillo
    medium: '#F59E0B',       // Ámbar
    none: '#9CA3AF',         // Gris
  },

  // --- 8. PALETA EXTENDIDA (Para Gráficas/Badges genéricos) ---
  // Útil para "Ejes Temáticos" (Suelo, Jurídico, Técnico, etc.)
  chart: {
    blue: '#3B82F6',
    indigo: '#6366F1',
    purple: '#8B5CF6',
    pink: '#EC4899',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    orange: '#F97316',
  },
};
