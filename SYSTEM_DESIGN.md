# System Design: SIPA v2 (Implementation Guide)

## 1. Alineación Arquitectónica
Este diseño extiende la arquitectura base definida en `README.md`.
* **Core Philosophy:** Feature-Based Architecture + Standalone Components.
* **State Management:** Angular Signals (Nativo).
* **Estilos:** TailwindCSS + SCSS.

## 2. Mapeo de Features (Dominios)

### A. `features/project-workspace` (Gestión de Proyectos - Pág 9)
Extender el módulo existente para soportar la "Bitácora" y el "Panel de Preguntas".

* **Ruta:** `src/app/features/project-workspace/`
* **Nuevos Componentes (`components/`):**
    * `QuestionNavigator`: Barra de navegación (1-17) con indicadores de estado (usa `status-badge`).
    * `TechnicalLog` (Bitácora): Chat que implementa `chat-bubble` y `traffic-light` para prioridades (Urgente, Alerta).
    * `SplitViewContainer`: Layout para la `validation-page` (PDF a la izq, Formulario a la der). **Regla:** El PDF no debe recargarse al cambiar de pregunta.

### B. `features/advisory-dashboard` (Módulo de Asesoría - Pág 10)
Nuevo módulo para la gestión de asesores y validación masiva.

* **Ruta:** `src/app/features/advisory-dashboard/`
* **Vistas (`pages/`):**
    * `AdvisorWorkspacePage`: Tabla de proyectos asignados. Debe mostrar columna "Escenario de Viabilidad".
* **Componentes (`components/`):**
    * `ViabilityScenarioBadge`: Badge calculado (Habilitado, Pre-habilitado, Sin Posibilidad).
    * `BulkValidationActions`: Botones flotantes para acciones rápidas (Validar, Devolver).

### C. `features/reports-analytics` (Módulo de Informes - Pág 11)
Nuevo módulo para visualización de datos y Power BI.

* **Ruta:** `src/app/features/reports-analytics/`
* **Vistas (`pages/`):**
    * `GeneralReportsPage`: Dashboard con filtros en cascada (Depto -> Municipio -> Organización).
* **Componentes (`components/`):**
    * `FilterCascade`: Selectores reactivos usando Signals.
    * `ChartContainer`: Wrapper para librerías de gráficas (ej. NgxCharts o ECharts).

## 3. Integración con UI Kit (`shared/ui`)
Utilizar estrictamente los componentes base ya definidos en la arquitectura:

* **`shared/ui/pdf-viewer`**: Para la visualización de evidencias en la pág 9.
* **`shared/ui/traffic-light`**: Para mostrar la prioridad de las notas en la bitácora (Urgente/Alerta).
* **`shared/ui/status-badge`**: Para el estado de las preguntas (Validado/Devuelto).

## 4. Definición de Modelos (Interfaces)

```typescript
// Basado en Requerimientos Pág 9 (Bitácora)
export interface LogMessage {
  id: string;
  timestamp: string;
  senderRole: 'ASESOR' | 'USUARIO' | 'SISTEMA';
  content: string;
  priority?: 'URGENTE' | 'ALERTA' | 'NORMAL'; // Mapped to Traffic Light
  evidenceId?: string; // Link to PDF attachment
}

// Basado en Requerimientos Pág 10 (Escenarios)
export enum ViabilityScenario {
  ENABLED = 'HABILITADO',
  PRE_ENABLED = 'PRE_HABILITADO',
  HIGH_POSSIBILITY = 'ALTA_POSIBILIDAD',
  NO_POSSIBILITY = 'SIN_POSIBILIDAD'
}
```
