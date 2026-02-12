# API de Gestión de Proyectos - PAVIS

## Endpoints Disponibles

### 1. Crear Proyecto (Flujo Consultante o Admin)

**Endpoint:** `POST /api/projects`

**Autenticación:** Requiere token JWT con rol CONSULTA o ADMIN

**Request Body:**
```typescript
interface CreateProjectRequest {
  name?: string;                            // Nombre del proyecto (opcional)
  organization: OrganizationRequest;           // Datos de la organización (requerido)
  department: string;                         // Departamento (requerido)
  municipality: string;                        // Municipio (requerido)
  dates: DatesRequest;                        // Fechas del proyecto (requerido)
  responseTeam?: ResponseTeamMember[];         // Equipo de respuesta (opcional)
}

interface OrganizationRequest {
  name: string;                                // Nombre de la organización (requerido)
  type: string;                                 // COMPANY o PERSON (requerido)
  identifier: string;                           // NIT/RUC/DNI (requerido)
  email: string;                                // Email de contacto (requerido)
  municipality: string;                         // Municipio (requerido)
  region: string;                               // Departamento/región (requerido)
  description?: string;                          // Descripción del objeto social (opcional)
  address?: string;                             // Dirección física (opcional)
}

interface DatesRequest {
  start: string;        // Fecha inicio formato YYYY-MM-DD (requerido)
  end: string;          // Fecha fin formato YYYY-MM-DD (requerido)
  submissionDeadline: string; // Fecha límite de entrega YYYY-MM-DD (requerido)
}

interface ResponseTeamMember {
  userName: string;      // Nombre del miembro del equipo
  userEmail: string;      // Email del miembro del equipo
  documentNumber: string; // Número de documento
}
```

**Ejemplo de Request:**
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Proyecto Piloto Educación",
  "organization": {
    "name": "Fundación Educativa ABC",
    "type": "COMPANY",
    "identifier": "900123456-1",
    "description": "Fundación dedicada a la educación rural",
    "address": "Calle 100 #15-20",
    "email": "contacto@fundacion.edu.co",
    "municipality": "Soacha",
    "region": "Cundinamarca"
  },
  "department": "Cundinamarca",
  "municipality": "Soacha",
  "dates": {
    "start": "2024-03-01",
    "end": "2024-12-31",
    "submissionDeadline": "2024-04-15"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Proyecto creado exitosamente",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "PRJ-2024-1234",
    "name": "Proyecto Piloto Educación",
    "organizationName": "Fundación Educativa ABC",
    "municipality": "Soacha",
    "state": "Cundinamarca",
    "status": "ACTIVE",
    "viabilityStatus": "PRE_HABILITADO",
    "advisor": null,
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "submissionDeadline": "2024-04-15T00:00:00Z",
    "correctionDeadline": null,
    "progress": {
      "technical": 0,
      "legal": 0,
      "financial": 0,
      "social": 0
    },
    "organization": {
      "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
      "name": "Fundación Educativa ABC",
      "type": "COMPANY",
      "identifier": "900123456-1",
      "email": "contacto@fundacion.edu.co",
      "municipality": "Soacha",
      "region": "Cundinamarca",
      "description": "Fundación dedicada a la educación rural",
      "address": "Calle 100 #15-20",
      "contactName": null,
      "status": "ACTIVE"
    }
  }
}
```

---

### 2. Actualizar Proyecto (Flujo Admin)

**Endpoint:** `PATCH /api/projects`

**Autenticación:** Requiere token JWT con rol ADMIN

**Request Body:**
```typescript
interface UpdateProjectRequest {
  id: string;                                 // ID del proyecto (requerido)
  name?: string;                               // Nombre del proyecto (opcional)
  status?: string;                               // ACTIVE, SUSPENDED, CERTIFIED, BENEFICIARY
  viabilityStatus?: string;                     // HABILITADO, PRE_HABILITADO, ALTA_POSIBILIDAD, SIN_POSIBILIDAD
  advisorId?: string;                            // ID del asesor a asignar
  activeAxes?: string[];                         // Ejes activos (SOCIAL, FINANCIERO, TECNICO, JURIDICO)
  technicalTable?: TechnicalTableMember[];          // Mesa técnica (opcional)
  responseTeam?: ResponseTeamMember[];           // Equipo de respuesta (opcional)
  dates?: DatesRequest;                         // Fechas (opcional)
}

interface TechnicalTableMember {
  axisId: string;    // ID del eje: SOCIAL, FINANCIERO, TECNICO, JURIDICO
  advisorId: string; // ID del asesor asignado al eje
}
```

**Ejemplo de Request:**
```http
PATCH /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "CERTIFIED",
  "viabilityStatus": "HABILITADO",
  "advisorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "activeAxes": ["SOCIAL", "FINANCIERO"],
  "technicalTable": [
    {
      "axisId": "SOCIAL",
      "advisorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    },
    {
      "axisId": "FINANCIERO",
      "advisorId": "4fa85f64-5717-4562-b3fc-2c963f66afa7"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Proyecto actualizado exitosamente",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "PRJ-2024-1234",
    "name": "Proyecto Piloto Educación",
    "organizationName": "Fundación Educativa ABC",
    "municipality": "Soacha",
    "state": "Cundinamarca",
    "status": "CERTIFIED",
    "viabilityStatus": "HABILITADO",
    "advisor": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Juan Pérez",
      "email": "asesor@pavis.com"
    },
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "submissionDeadline": "2024-04-15T00:00:00Z",
    "correctionDeadline": null,
    "progress": {
      "technical": 0,
      "legal": 0,
      "financial": 0,
      "social": 0
    }
  }
}
```

---

### 3. Obtener Proyecto por ID

**Endpoint:** `GET /api/projects/{id}`

**Autenticación:** Requiere token JWT

**Parámetros de Ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del proyecto |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Proyecto encontrado",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "PRJ-2024-1234",
    "name": "Proyecto Piloto Educación",
    "organizationName": "Fundación Educativa ABC",
    "municipality": "Soacha",
    "state": "Cundinamarca",
    "status": "ACTIVE",
    "viabilityStatus": "PRE_HABILITADO",
    "advisor": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Juan Pérez",
      "email": "asesor@pavis.com"
    },
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "submissionDeadline": "2024-04-15T00:00:00Z",
    "correctionDeadline": null,
    "progress": {
      "technical": 25,
      "legal": 40,
      "financial": 10,
      "social": 60
    },
    "organization": {
      "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
      "name": "Fundación Educativa ABC",
      "type": "COMPANY",
      "identifier": "900123456-1",
      "email": "contacto@fundacion.edu.co",
      "municipality": "Soacha",
      "region": "Cundinamarca",
      "description": "Fundación dedicada a la educación rural",
      "address": "Calle 100 #15-20",
      "contactName": null,
      "status": "ACTIVE"
    }
  }
}
```

---

### 4. Obtener Lista de Proyectos (Paginado)

**Endpoint:** `GET /api/projects`

**Autenticación:** Requiere token JWT

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Número de página |
| `limit` | number | No | 10 | Elementos por página |
| `search` | string | No | null | Buscar por código o nombre de organización |
| `status` | string | No | null | Filtrar por estado (ACTIVE, SUSPENDED, CERTIFIED, BENEFICIARY) |
| `viabilityStatus` | string | No | null | Filtrar por viabilidad (HABILITADO, PRE_HABILITADO, ALTA_POSIBILIDAD, SIN_POSIBILIDAD) |

**Ejemplo de Request:**
```http
GET /api/projects?page=1&limit=20&status=ACTIVE&search=Educación
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Proyectos obtenidos exitosamente",
  "data": {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "code": "PRJ-2024-1234",
        "name": "Proyecto Piloto Educación",
        "organizationName": "Fundación Educativa ABC",
        "municipality": "Soacha",
        "state": "Cundinamarca",
        "status": "ACTIVE",
        "viabilityStatus": "PRE_HABILITADO",
        "advisor": {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "name": "Juan Pérez",
          "email": "asesor@pavis.com"
        },
        "startDate": "2024-03-01T00:00:00Z",
        "endDate": "2024-12-31T00:00:00Z",
        "submissionDeadline": "2024-04-15T00:00:00Z",
        "correctionDeadline": null,
        "progress": {
          "technical": 25,
          "legal": 40,
          "financial": 10,
          "social": 60
        }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

## Códigos de Error Comunes

| Código HTTP | Descripción | Posible Causa |
|------------|-------------|---------------|
| 200 OK | Operación exitosa | - |
| 201 Created | Proyecto creado exitosamente | - |
| 400 Bad Request | Datos inválidos | Campos faltantes, tipos incorrectos, fechas inválidas |
| 401 Unauthorized | Token inválido o expirado | Sesión expirada, token incorrecto |
| 403 Forbidden | Permisos insuficientes | Usuario no tiene el rol requerido |
| 404 Not Found | Recurso no encontrado | Proyecto no existe |
| 500 Internal Server Error | Error del servidor | Contactar al equipo de soporte |

---

## Ejemplo de Implementación en Angular

### Servicio de Proyectos (project.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:5000/api/projects';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear proyecto
  createProject(project: CreateProjectRequest): Observable<any> {
    return this.http.post(this.apiUrl, project, {
      headers: this.getHeaders()
    });
  }

  // Actualizar proyecto
  updateProject(project: UpdateProjectRequest): Observable<any> {
    return this.http.patch(this.apiUrl, project, {
      headers: this.getHeaders()
    });
  }

  // Obtener proyecto por ID
  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener lista de proyectos
  getProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    viabilityStatus?: string;
  }): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.getHeaders(),
      params
    });
  }
}

// Interfaces TypeScript
export interface CreateProjectRequest {
  name?: string;
  organization: OrganizationRequest;
  department: string;
  municipality: string;
  dates: DatesRequest;
  responseTeam?: ResponseTeamMember[];
}

export interface OrganizationRequest {
  name: string;
  type: string;
  identifier: string;
  email: string;
  municipality: string;
  region: string;
  description?: string;
  address?: string;
}

export interface DatesRequest {
  start: string;
  end: string;
  submissionDeadline: string;
}

export interface ResponseTeamMember {
  userName: string;
  userEmail: string;
  documentNumber: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  status?: string;
  viabilityStatus?: string;
  advisorId?: string;
  activeAxes?: string[];
  technicalTable?: TechnicalTableMember[];
  responseTeam?: ResponseTeamMember[];
  dates?: DatesRequest;
}

export interface TechnicalTableMember {
  axisId: string;
  advisorId: string;
}
```

### Ejemplo de Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { ProjectService, CreateProjectRequest } from './project.service';

@Component({
  selector: 'app-project-create',
  template: `
    <div class="project-form">
      <h2>Crear Nuevo Proyecto</h2>

      <form #projectForm="ngForm" (ngSubmit)="onSubmit()">
        <!-- Datos de la organización -->
        <div class="form-section">
          <h3>Datos de la Organización</h3>
          <div class="form-group">
            <label>Nombre *</label>
            <input type="text" [(ngModel)]="project.organization.name" required>
          </div>

          <div class="form-group">
            <label>Tipo *</label>
            <select [(ngModel)]="project.organization.type" required>
              <option value="COMPANY">Empresa (Jurídica)</option>
              <option value="PERSON">Persona Natural</option>
            </select>
          </div>

          <div class="form-group">
            <label>NIT/Identificador *</label>
            <input type="text" [(ngModel)]="project.organization.identifier" required>
          </div>

          <div class="form-group">
            <label>Email de Contacto *</label>
            <input type="email" [(ngModel)]="project.organization.email" required>
          </div>

          <div class="form-group">
            <label>Municipio *</label>
            <input type="text" [(ngModel)]="project.organization.municipality" required>
          </div>

          <div class="form-group">
            <label>Departamento *</label>
            <input type="text" [(ngModel)]="project.organization.region" required>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="project.organization.description"></textarea>
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <input type="text" [(ngModel)]="project.organization.address">
          </div>
        </div>

        <!-- Ubicación del proyecto -->
        <div class="form-section">
          <h3>Ubicación del Proyecto</h3>
          <div class="form-group">
            <label>Departamento *</label>
            <input type="text" [(ngModel)]="project.department" required>
          </div>

          <div class="form-group">
            <label>Municipio *</label>
            <input type="text" [(ngModel)]="project.municipality" required>
          </div>
        </div>

        <!-- Fechas del proyecto -->
        <div class="form-section">
          <h3>Fechas del Proyecto</h3>
          <div class="form-group">
            <label>Fecha de Inicio *</label>
            <input type="date" [(ngModel)]="project.dates.start" required>
          </div>

          <div class="form-group">
            <label>Fecha de Fin *</label>
            <input type="date" [(ngModel)]="project.dates.end" required>
          </div>

          <div class="form-group">
            <label>Fecha Límite de Entrega *</label>
            <input type="date" [(ngModel)]="project.dates.submissionDeadline" required>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creando...' : 'Crear Proyecto' }}
          </button>
          <button type="button" (click)="resetForm()">Cancelar</button>
        </div>
      </form>
    </div>
  `
})
export class ProjectCreateComponent implements OnInit {
  loading = false;
  project: CreateProjectRequest = {
    organization: {
      name: '',
      type: 'COMPANY',
      identifier: '',
      email: '',
      municipality: '',
      region: '',
      description: '',
      address: ''
    },
    department: '',
    municipality: '',
    dates: {
      start: '',
      end: '',
      submissionDeadline: ''
    }
  };

  constructor(private projectService: ProjectService) {}

  ngOnInit() {}

  onSubmit() {
    if (!this.projectForm.form.valid) {
      return;
    }

    this.loading = true;
    this.projectService.createProject(this.project).subscribe({
      next: (response) => {
        console.log('Proyecto creado:', response);
        alert('Proyecto creado exitosamente');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al crear proyecto:', err);
        alert('Error al crear el proyecto');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  resetForm() {
    this.project = {
      organization: {
        name: '',
        type: 'COMPANY',
        identifier: '',
        email: '',
        municipality: '',
        region: '',
        description: '',
        address: ''
      },
      department: '',
      municipality: '',
      dates: {
        start: '',
        end: '',
        submissionDeadline: ''
      }
    };
    this.projectForm.reset();
  }
}
```

---

## Notas Importantes para el Frontend

### Comportamiento de Creación Parcial

1. **Organización Duplicada:** Si la organización ya existe (por NIT), se vincula automáticamente. No se crea una duplicada.

2. **Código Autogenerado:** El código del proyecto se genera automáticamente en el formato `PRJ-YYYY-XXXX`. No es necesario enviarlo.

3. **Estado Inicial:** El proyecto se crea con:
   - `status`: `ACTIVE`
   - `viabilityStatus`: `PRE_HABILITADO`
   - `advisorId`: `null` (sin asignar)
   - `progress`: todos los ejes en 0

4. **Validaciones:**
   - `start < end` (la fecha de inicio debe ser anterior a la fecha de fin)
   - `end < submissionDeadline` (la fecha límite debe ser posterior a la fecha de fin)
   - Tipo de organización: `COMPANY` o `PERSON`
   - Todos los campos marcados con `*` son requeridos

### Permisos por Rol

| Rol | Crear Proyecto | Actualizar Proyecto | Ver Proyectos |
|-----|---------------|-------------------|---------------|
| ADMIN | ✅ | ✅ | ✅ (todos) |
| CONSULTA | ✅ | ❌ | ✅ (solo los creados por el mismo usuario) |
| ASESOR | ❌ | ❌ | ✅ (solo asignados) |
| SPAT | ❌ | ❌ | ✅ |
| ORGANIZACION | ❌ | ❌ | ✅ (solo propios) |

### Filtrado de Proyectos

- **ADMIN:** Puede ver todos los proyectos del sistema
- **CONSULTA:** Solo puede ver los proyectos que ha creado él mismo
- **ASESOR:** Solo puede ver los proyectos que le han sido asignados
- **SPAT:** Solo puede ver todos los proyectos
- **ORGANIZACION:** Solo puede ver sus propios proyectos

### Estados del Proyecto

| Estado | Descripción |
|--------|-------------|
| `ACTIVE` | En ejecución/formulación |
| `SUSPENDED` | Suspendido temporalmente |
| `CERTIFIED` | Certificado/Aprobado |
| `BENEFICIARY` | Beneficiario seleccionado |

### Estados de Viabilidad

| Estado | Descripción |
|--------|-------------|
| `HABILITADO` | Cumple requisitos |
| `PRE_HABILITADO` | En proceso de habilitación |
| `ALTA_POSIBILIDAD` | Potencial alto |
| `SIN_POSIBILIDAD` | Rechazado |

---

## URLs de Acceso

- **API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger/index.html`

## Token de Autenticación

Para usar los endpoints, incluir el token en el header:

```http
Authorization: Bearer {token}
```

El token se obtiene al hacer login en `/api/auth/login`.
