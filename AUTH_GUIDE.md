# API de Gestión de Usuarios - PAVIS

## Endpoints Disponibles (Solo ADMIN)

### 1. Obtener Lista de Usuarios

**Endpoint:** `GET /api/auth/users`

**Autenticación:** Requiere token JWT con rol ADMIN

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Número de página |
| `limit` | number | No | 10 | Elementos por página |
| `role` | string | No | null | Filtrar por rol (ADMIN, ASESOR, SPAT, CONSULTA, ORGANIZACION) |
| `search` | string | No | null | Buscar por nombre o email |
| `status` | string | No | null | Filtrar por estado (ACTIVE, INACTIVE) |

**Ejemplo de Request:**
```http
GET /api/auth/users?page=1&limit=10&role=ASESOR&status=ACTIVE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "data": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Juan Pérez",
        "email": "asesor@pavis.com",
        "role": "ASESOR",
        "status": "ACTIVE",
        "avatarColor": "bg-blue-500",
        "projectsAssigned": 5
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. Actualizar Usuario

**Endpoint:** `PATCH /api/auth/users`

**Autenticación:** Requiere token JWT con rol ADMIN

**Request Body:**
```typescript
interface UpdateUserRequest {
  id: string;                  // UUID del usuario (obligatorio)
  name?: string;               // Nombre completo (opcional)
  email?: string;              // Email (opcional, debe ser único)
  role?: string;               // Rol: ADMIN, ASESOR, SPAT, CONSULTA, ORGANIZACION
  avatarColor?: string;        // Color del avatar para UI (ej: 'bg-blue-500')
}
```

**Ejemplo de Request:**
```http
PATCH /api/auth/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Juan Pérez García",
  "email": "juan.perez@pavis.com",
  "role": "ASESOR",
  "avatarColor": "bg-green-500"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "message": "Usuario actualizado exitosamente",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Juan Pérez García",
      "email": "juan.perez@pavis.com",
      "role": "ASESOR",
      "status": "ACTIVE",
      "avatarColor": "bg-green-500",
      "projectsAssigned": 5
    }
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o email duplicado
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario no es ADMIN
- `500 Internal Server Error`: Error del servidor

---

### 3. Activar/Desactivar Usuario

**Endpoint:** `PATCH /api/auth/users/status`

**Autenticación:** Requiere token JWT con rol ADMIN

**Request Body:**
```typescript
interface ToggleUserStatusRequest {
  id: string;        // UUID del usuario (obligatorio)
  status: string;    // Estado: ACTIVE o INACTIVE (obligatorio)
}
```

**Ejemplo de Request (Desactivar):**
```http
PATCH /api/auth/users/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "INACTIVE"
}
```

**Ejemplo de Request (Activar):**
```http
PATCH /api/auth/users/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario inactive exitosamente",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "message": "Usuario inactive exitosamente",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Juan Pérez",
      "email": "asesor@pavis.com",
      "role": "ASESOR",
      "status": "INACTIVE",
      "avatarColor": "bg-blue-500",
      "projectsAssigned": 5
    }
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario no es ADMIN o intenta desactivarse a sí mismo
- `500 Internal Server Error`: Error del servidor

---

## Importante para el Frontend

### Comportamiento de Usuario INACTIVE

- **Un usuario con estado INACTIVE NO puede iniciar sesión**
- El login fallará con el mensaje: "Usuario no encontrado o inactivo"

### Reglas de Negocio

1. **Solo el ADMIN puede editar usuarios**
2. **Solo el ADMIN puede activar/desactivar usuarios**
3. **Un ADMIN no puede desactivarse a sí mismo**
4. **El email debe ser único en el sistema**
5. **Todos los campos en UPDATE son opcionales** (excepto el ID)

### Roles Disponibles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Administrador del sistema |
| ASESOR | Asesor técnico/jurídico/financiero/social |
| SPAT | Supervisor de proyectos |
| CONSULTA | Solo lectura |
| ORGANIZACION | Entidad externa |

### Estados de Usuario

| Estado | Descripción |
|--------|-------------|
| ACTIVE | Usuario puede iniciar sesión |
| INACTIVE | Usuario bloqueado, no puede iniciar sesión |

---

## Ejemplos de Implementación en Angular

### Servicio de Usuarios (user.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/auth/users';
  private statusUrl = 'http://localhost:5000/api/auth/users/status';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener usuarios con filtros
  getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  // Actualizar usuario
  updateUser(user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    avatarColor?: string;
  }): Observable<any> {
    return this.http.patch(this.apiUrl, user, {
      headers: this.getHeaders()
    });
  }

  // Activar/Desactivar usuario
  toggleUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Observable<any> {
    return this.http.patch(this.statusUrl, {
      id: userId,
      status: status
    }, {
      headers: this.getHeaders()
    });
  }
}
```

### Ejemplo de Uso en Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-management',
  template: `
    <div *ngIf="loading">Cargando usuarios...</div>
    <div *ngIf="error" class="error">{{ error }}</div>

    <table *ngIf="!loading && !error">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span [class.active]="user.status === 'ACTIVE'"
                  [class.inactive]="user.status === 'INACTIVE'">
              {{ user.status }}
            </span>
          </td>
          <td>
            <button (click)="editUser(user)">Editar</button>
            <button (click)="toggleStatus(user)"
                    *ngIf="user.status === 'ACTIVE'">Desactivar</button>
            <button (click)="toggleStatus(user)"
                    *ngIf="user.status === 'INACTIVE'">Activar</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers({ page: 1, limit: 10 }).subscribe({
      next: (response: any) => {
        this.users = response.data.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  editUser(user: any) {
    // Abrir modal de edición
    console.log('Editar usuario:', user);
  }

  toggleStatus(user: any) {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.status = newStatus;
      },
      error: (err) => {
        alert('Error al cambiar estado: ' + err.error.message);
      }
    });
  }
}
```

---

## URL Base

- **API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger/index.html`

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@pavis.com | Admin123! |
