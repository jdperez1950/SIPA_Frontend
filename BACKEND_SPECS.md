# Especificaciones de Backend para PAVIS (SIPA V2)

Este documento detalla los modelos de datos, contratos de API implícitos y lógica de negocio que el Backend debe implementar para soportar el Frontend actual de PAVIS.

---

## 1. Modelos de Dominio (Entidades Principales)

### 1.1 Usuario (`User`)
**Tabla:** `users`
| Campo | Tipo | Requerido | Descripción/Valores |
|-------|------|-----------|---------------------|
| `id` | UUID/String | Sí | Identificador único |
| `name` | String | Sí | Nombre completo |
| `email` | String | Sí | Correo electrónico (único) |
| `role` | Enum | Sí | `ADMIN`, `ASESOR`, `SPAT`, `CONSULTA`, `ORGANIZACION` |
| `status` | Enum | Sí | `ACTIVE`, `INACTIVE` |
| `password` | String | Sí | Hash (no expuesto en frontend) |
| `avatarColor`| String | No | Color de UI (ej. 'bg-blue-500') |
| `projectsAssigned` | Number | No | Contador de proyectos (para Asesores) |

### 1.2 Organización (`Organization`)
**Tabla:** `organizations`
| Campo | Tipo | Requerido | Descripción/Valores |
|-------|------|-----------|---------------------|
| `id` | UUID/String | Sí | Identificador único |
| `name` | String | Sí | Razón Social o Nombre |
| `type` | Enum | Sí | `COMPANY` (Jurídica), `PERSON` (Natural) |
| `identifier` | String | Sí | NIT, RUC o DNI |
| `email` | String | Sí | Correo de contacto |
| `municipality` | String | Sí | Municipio |
| `region` | String | Sí | Departamento/Región |
| `contactName` | String | No | Nombre de la persona de contacto |
| `status` | Enum | Sí | `ACTIVE`, `INACTIVE` |
| `userId` | UUID | No | FK a `users` (Cuenta de acceso asociada) |

### 1.3 Proyecto (`Project`)
**Tabla:** `projects`
| Campo | Tipo | Requerido | Descripción/Valores |
|-------|------|-----------|---------------------|
| `id` | UUID/String | Sí | Identificador único |
| `code` | String | Sí | Código autogenerado (ej. PROJ-1234) |
| `organization`| String | Sí | Nombre de la Organización (Desnormalizado o FK) |
| `municipality`| String | Sí | Municipio |
| `state` | String | Sí | Departamento |
| `status` | Enum | Sí | `ACTIVE`, `SUSPENDED`, `CERTIFIED`, `BENEFICIARY` |
| `viabilityStatus` | Enum | Sí | `HABILITADO`, `PRE_HABILITADO`, `ALTA_POSIBILIDAD`, `SIN_POSIBILIDAD` |
| `advisorId` | UUID | No | FK a `users` (Asesor Principal). En GET devuelve objeto `{id, name}` |
| `startDate` | Date (ISO) | Sí | Fecha inicio (YYYY-MM-DD) |
| `endDate` | Date (ISO) | Sí | Fecha fin (YYYY-MM-DD) |
| `submissionDeadline` | Date (ISO) | Sí | Fecha límite de entrega |
| `correctionDeadline` | Date (ISO) | No | Fecha límite de subsanación |

**Progreso del Proyecto (Embeddable/JSON):**
```json
{
  "technical": 0-100,
  "legal": 0-100,
  "financial": 0-100,
  "social": 0-100
}
```

---

### 1.4 Wrappers de Respuesta
**Paginación (`PaginatedResponse<T>`):**
Todas las listas (Usuarios, Proyectos, Organizaciones) deben devolver esta estructura:
```typescript
{
  "data": T[],
  "meta": {
    "totalItems": number,
    "itemCount": number, // Items en esta página
    "itemsPerPage": number,
    "totalPages": number,
    "currentPage": number
  }
}
```

---

## 2. Motor de Preguntas y Respuestas (Dynamic Forms)

### 2.1 Definición de Pregunta (`QuestionDefinition`)
**Tabla:** `questions` (Catálogo estático o dinámico)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String | Clave única (ej. 'Q-LEGAL-01') |
| `axisId` | String | Eje: `SOCIAL`, `FINANCIERO`, `TECNICO`, `JURIDICO` |
| `order` | Number | Orden de visualización |
| `text` | String | Enunciado de la pregunta |
| `helpText` | String | Texto de ayuda/tooltip (Opcional) |
| `controlType` | Enum | `TEXT_AREA`, `SINGLE_SELECT`, `MULTI_SELECT`, `DATE`, `INFO_ONLY` |
| `requiresEvidence` | Boolean | Si exige adjuntar archivo |
| `evidenceConfig` | JSON | Configuración de archivos (ver abajo) |
| `options` | JSON | Array de `{ label: string, value: any }` (para selects) |
| `dependencies` | JSON | Lógica de mostrar/ocultar |

---

## 3. Endpoints Clave y Lógica de Negocio

### 3.1 Creación Parcial de Proyectos (Flujo Consultante)
**Endpoint:** `POST /api/projects` (o `/api/projects/init`)

**Objetivo:** Permitir a usuarios con rol `CONSULTA` (o `ADMIN`) registrar la fase inicial de un proyecto (Identificación) sin requerir la totalidad de la información técnica.

**Request Body (JSON):**
```json
{
  "name": "Nombre del Proyecto", // Opcional si se genera automáticamente
  "organization": {
    "name": "Fundación Nuevos Horizontes",
    "identifier": "900123456-1",
    "description": "Objeto social...",
    "address": "Calle 123..."
  },
  "department": "Cundinamarca",
  "municipality": "Soacha",
  "dates": {
    "start": "2024-03-01",
    "end": "2024-12-31",
    "submissionDeadline": "2024-04-15"
  },
  // Opcional: Response Team inicial si aplica
  "responseTeam": [] 
}
```

**Comportamiento Esperado del Backend:**
1.  **Validación:** Verificar que el usuario tenga rol `CONSULTA` o `ADMIN`. Solo validar campos de identificación y fechas. Ignorar o permitir vacíos en ejes técnicos.
2.  **Organización:**
    *   Buscar si la organización ya existe (por NIT/Identifier).
    *   Si no existe, crear registro en tabla `organizations`.
    *   Si existe, vincularla.
3.  **Proyecto:**
    *   Crear registro en `projects`.
    *   Generar código único (ej. `PRJ-2024-006`).
    *   Establecer `status = 'ACTIVE'` (o `'DRAFT'`).
    *   Establecer `viabilityStatus = 'PRE_HABILITADO'` (por defecto).
    *   Inicializar `progress` en 0 para todos los ejes.
    *   Dejar `advisorId` en `NULL` (sin asignar).
4.  **Respuesta:** Devolver el objeto `Project` creado con su ID generado.

### 3.2 Completitud del Proyecto (Flujo Admin)
**Endpoint:** `PATCH /api/projects/{id}`

**Objetivo:** Permitir al Administrador completar la información faltante (Asignación de Ejes, Equipo de Respuesta, Evaluación Inicial).

**Lógica:**
*   Recibir datos parciales o totales.
*   Actualizar estado si se completan requisitos.
*   Asignar `advisorId` si se envía en el payload.
