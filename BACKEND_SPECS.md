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

**Configuración de Evidencia (`EvidenceConfig`):**
```json
{
  "maxSizeMb": 10,
  "allowedFormats": [".pdf", ".zip", ".docx"],
  "requiresExpirationDate": true // Si el usuario debe ingresar fecha de vencimiento del doc
}
```

**Lógica de Dependencias:**
El backend debe validar si una pregunta debe ser respondida basándose en:
```typescript
interface QuestionDependency {
  dependentOnQuestionId: string; // ID de la pregunta padre
  triggerValue: any;             // Valor que activa la visibilidad
  action: 'SHOW' | 'HIDE';       // Acción
}
```

### 2.2 Respuesta de Proyecto (`QuestionResponse`)
**Tabla:** `project_responses`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `projectId` | UUID | FK a `projects` |
| `questionId` | String | FK a `questions` |
| `value` | Any | Valor de la respuesta (Texto, ID opción, Fecha) |
| `evaluationStatus` | Enum | `PENDING`, `VALIDATED`, `RETURNED`, `IN_PROCESS` |
| `evaluatorObservation` | String | Feedback del asesor |
| `lastUpdated` | Timestamp | Fecha última modificación |

**Evidencia Adjunta (Embeddable/Relación):**
```json
{
  "fileUrl": "https://storage...",
  "fileName": "acta_constitucion.pdf",
  "uploadDate": "ISO-8601",
  "expirationDate": "ISO-8601" // Opcional
}
```

---

## 3. Contratos de API (Endpoints Críticos)

### 3.1 Creación de Proyecto (Wizard V2)
**POST** `/api/projects`
El frontend envía un objeto complejo `CreateProjectRequest` que el backend debe procesar para crear el Proyecto, asignar el Equipo de Respuesta y la Mesa Técnica.

**Body Payload:**
```typescript
{
  // Paso 1: Identificación
  "name": "Nombre del Proyecto",
  "department": "Cundinamarca",
  "municipality": "Bogotá",
  "organization": { // Datos para crear/vincular organización
    "name": "Alcaldía X",
    "identifier": "NIT-123",
    "address": "Calle 123",
    "description": "..."
  },
  "dates": {
    "start": "2024-01-01",
    "end": "2024-12-31",
    "submissionDeadline": "2024-06-30"
  },
  
  // Paso 2: Evaluación (Ejes Activos)
  "activeAxes": ["SOCIAL", "FINANCIERO"], // IDs de ejes seleccionados
  
  // Paso 3: Mesa Técnica (Asignación de Asesores por Eje)
  "technicalTable": [
    { "axisId": "SOCIAL", "advisorId": "user-uuid-1" },
    { "axisId": "FINANCIERO", "advisorId": "user-uuid-2" }
  ],
  
  // Paso 4: Equipo de Respuesta (Usuarios de la Organización)
  "responseTeam": [
    {
      "userName": "Juan Perez",
      "userEmail": "juan@org.com", // Crear usuario si no existe
      "documentNumber": "123456",
      "role": "ORGANIZACION" // Implícito
    }
  ]
}
```

### 3.2 Gestión de Usuarios
*   **GET** `/api/users?page=1&limit=10&q=search`: Paginación y búsqueda.
*   **POST** `/api/users`: Crear usuario administrativo.
*   **PATCH** `/api/users/:id/status`: Toggle ACTIVE/INACTIVE.

### 3.3 Gestión de Organizaciones
*   **POST** `/api/organizations`: Crear organización (soporta `multipart/form-data` si hay logo/docs).
*   **GET** `/api/organizations/:id/users`: Obtener usuarios vinculados a una org.

---

### 3.4 Autenticación
*   **POST** `/api/auth/login`
    *   Body: `{ "email": "...", "password": "..." }`
    *   **Respuesta Recomendada (Hybrid):**
        Se devuelve tanto el Token como el Objeto Usuario.
        *   **Token**: Fuente de verdad para seguridad y autorización.
        *   **User Object**: Copia de conveniencia para la UI (evita decodificar JWT en cliente).
    *   Response:
        ```json
        {
          "token": "eyJhbGciOiJIUz...",
          "user": {
            "id": "...",
            "name": "...",
            "role": "ADMIN",
            "email": "..."
          }
        }
        ```
    
    *   **Contenido esperado del Token (JWT Payload):**
        El backend DEBE incluir estos claims dentro del token para validación stateless:
        ```json
        {
          "sub": "user-uuid",    // ID del usuario
          "email": "...",
          "role": "ADMIN",       // CRÍTICO: Para Guards del Backend
          "exp": 1719999999,     // Expiración
          "iat": 1719990000
        }
        ```

---

## 4. Referencia de Enums (Valores Permitidos)

### UserRole
*   `ADMIN`: Administrador del Sistema
*   `ASESOR`: Asesor Técnico/Jurídico/Financiero/Social
*   `SPAT`: Supervisor de Proyectos
*   `CONSULTA`: Solo lectura
*   `ORGANIZACION`: Entidad externa (Alcaldía, Asociación)

### ProjectStatus
*   `ACTIVE`: En ejecución/formulación
*   `SUSPENDED`: Suspendido temporalmente
*   `CERTIFIED`: Certificado/Aprobado
*   `BENEFICIARY`: Beneficiario seleccionado

### ViabilityScenario
*   `HABILITADO`: Cumple requisitos
*   `PRE_HABILITADO`: En proceso de habilitación
*   `ALTA_POSIBILIDAD`: Potencial alto
*   `SIN_POSIBILIDAD`: Rechazado

### QuestionControlType
*   `TEXT_AREA`: Campo de texto largo
*   `SINGLE_SELECT`: Selección única (Radio/Select)
*   `MULTI_SELECT`: Selección múltiple (Checkbox)
*   `DATE`: Selector de fecha
*   `INFO_ONLY`: Texto informativo (sin respuesta)

---

## 5. Seguridad y Reglas de Negocio

1.  **Autenticación:**
    *   JWT Token (Bearer Auth).
    *   **Auto-Logout:** Frontend cierra sesión tras 15min de inactividad. Backend debe validar expiración de token.

2.  **Roles (RBAC):**
    *   `ADMIN`: Acceso total (Usuarios, Proyectos, Configuración).
    *   `ASESOR`: Solo ve proyectos asignados a él (o su eje). Puede validar respuestas (`VALIDATED`/`RETURNED`).
    *   `ORGANIZACION`: Solo ve su propio proyecto. Puede editar respuestas solo si el proyecto está `ACTIVE` o `RETURNED_FOR_CORRECTION`.

3.  **Restricciones de Edición:**
    *   Las organizaciones NO pueden editar datos básicos del proyecto (nombre, fechas) una vez creado. Solo Admin.
    *   Las respuestas solo se pueden editar si el estado de evaluación no es `VALIDATED`.

4.  **Almacenamiento de Archivos:**
    *   Frontend espera URLs firmadas o públicas para los PDFs.
    *   **No Base64** para archivos grandes.
