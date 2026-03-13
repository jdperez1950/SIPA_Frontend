# Componentes UI Reutilizables

Este documento describe los componentes UI reutilizables implementados para estandarizar la interfaz de usuario en el proyecto PAVIS, siguiendo el Sistema de Diseño y la paleta de colores institucional.

## Índice
1. [ExpandableTableComponent](#expandabletablecomponent)
2. [DashboardStatsComponent](#dashboardstatscomponent)

---

## ExpandableTableComponent

Componente de tabla avanzado que soporta expansión de filas (Master-Detail), columnas semánticas (con colores automáticos), selección múltiple y ordenamiento. Diseñado para manejar estructuras jerárquicas como *Proyecto -> Ejes -> Preguntas*.

### Ubicación
`src/app/shared/components/expandable-table/expandable-table.component.ts`

### Características Principales
- **Expansión Anidada**: Permite expandir filas para mostrar detalles complejos mediante `ng-template`.
- **Estilos Semánticos**: Aplica automáticamente los colores de la paleta PAVIS para estados, prioridades y viabilidad.
- **Selección**: Soporte opcional para checkboxes de selección múltiple.
- **Responsive**: Diseño adaptable con scroll horizontal.

### API del Componente

#### Inputs
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `data` | `any[]` | Array de datos a mostrar. |
| `columns` | `TableColumn[]` | Definición de las columnas. |
| `title` | `string` | Título opcional de la tabla. |
| `selectable` | `boolean` | Habilita la columna de checkboxes (default: `false`). |
| `showTools` | `boolean` | Muestra la barra de herramientas superior (default: `true`). |
| `showExpandControls` | `boolean` | Muestra botones de expandir/colapsar todo (default: `true`). |
| `showFooter` | `boolean` | Muestra el pie de tabla con contador (default: `true`). |

#### Outputs
| Evento | Tipo | Descripción |
|--------|------|-------------|
| `selectionChange` | `EventEmitter<any[]>` | Emite el array de filas seleccionadas cuando cambia la selección. |

#### Definición de Columnas (`TableColumn`)
```typescript
interface TableColumn {
  header: string;     // Texto del encabezado
  field: string;      // Nombre de la propiedad en el objeto de datos
  type?: 'text'       // Texto simple (default)
       | 'date'       // Formato de fecha
       | 'currency'   // Formato de moneda (COP)
       | 'status'     // Badge con colores de estado PAVIS
       | 'priority'   // Badge con colores de prioridad PAVIS
       | 'viability'  // Badge con colores de viabilidad PAVIS
       | 'progress'   // Barra de progreso
       | 'custom'     // Usa template personalizado
       | 'actions';   // Columna de acciones
  width?: string;     // Ancho CSS (ej. '150px')
  align?: 'left' | 'center' | 'right';
}
```

### Integración con Paleta de Colores PAVIS

El componente mapea automáticamente los valores del backend a los colores definidos en `theme-colors.ts`:

**Estados (`type: 'status'`)**
- `VALIDATED` / `VALIDADO` -> Verde (Éxito)
- `RETURNED` / `DEVUELTO` -> Rojo (Error/Alerta)
- `PROCESS` / `EN_PROCESO` -> Azul (Info)
- `PENDING` / `PENDIENTE` -> Gris (Neutro)

**Prioridad (`type: 'priority'`)**
- `URGENT` / `ALTA` -> Rojo (Error)
- `ALERT` / `MEDIA` -> Naranja (Advertencia)
- `INFO` / `BAJA` -> Azul (Info)

**Viabilidad (`type: 'viability'`)**
- `ENABLED` / `HABILITADO` -> Verde
- `PRE_ENABLED` / `PRE_HABILITADO` -> Lima
- `HIGH` / `ALTA` -> Amarillo
- `MEDIUM` / `MEDIA` -> Ámbar
- `NONE` / `BAJA` -> Gris

### Ejemplo de Uso

```html
<app-expandable-table
  [data]="projects"
  [columns]="columns"
  [selectable]="true"
  (selectionChange)="onSelectionChange($event)">

  <!-- Template para Fila Expandida (Detalle) -->
  <ng-template #expandedRowTemplate let-row>
    <div class="p-4 bg-gray-50 rounded-lg">
      <h4>Detalles del Proyecto: {{ row.name }}</h4>
      <!-- Contenido anidado, incluso otra tabla -->
    </div>
  </ng-template>

  <!-- Template para Acciones -->
  <ng-template #actionsTemplate let-row>
    <button (click)="edit(row)" class="text-blue-600 hover:underline">Editar</button>
  </ng-template>

</app-expandable-table>
```

---

## DashboardStatsComponent

Componente para visualizar métricas clave (KPIs) y filtros en la parte superior de los dashboards.

### Ubicación
`src/app/shared/components/dashboard-stats/dashboard-stats.component.ts`

### Características Principales
- **Tarjetas de Métricas**: Muestra valores clave con iconos, etiquetas y tendencias.
- **Área de Filtros**: Contenedor flexible para proyectar controles de filtrado.
- **Estilos Visuales**: Tarjetas con efectos de hover e iconos de fondo decorativos.

### API del Componente

#### Inputs
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `stats` | `StatItem[]` | Lista de métricas a mostrar. |
| `showFilters` | `boolean` | Muestra/oculta la sección de filtros (default: `true`). |

#### Definición de Métricas (`StatItem`)
```typescript
interface StatItem {
  label: string;          // Etiqueta descriptiva
  value: string | number; // Valor principal
  icon: string;           // Nombre del icono (Material Symbols)
  trend?: string;         // Texto de tendencia (ej. "+5%")
  trendDirection?: 'up' | 'down' | 'neutral'; // Dirección de la tendencia
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'; // Color del icono/fondo
}
```

### Ejemplo de Uso

```html
<app-dashboard-stats [stats]="kpiStats">
  <!-- Contenido proyectado en la zona de filtros -->
  <select class="border rounded px-3 py-2">
    <option>Todos los estados</option>
    <option>Activos</option>
  </select>
  
  <input type="text" placeholder="Buscar..." class="border rounded px-3 py-2">
</app-dashboard-stats>
```

```typescript
// En el componente padre
kpiStats: StatItem[] = [
  { 
    label: 'Proyectos Activos', 
    value: 12, 
    icon: 'folder_open', 
    color: 'primary',
    trend: '+2',
    trendDirection: 'up'
  },
  { 
    label: 'Alertas', 
    value: 3, 
    icon: 'warning', 
    color: 'warning' 
  }
];
```
