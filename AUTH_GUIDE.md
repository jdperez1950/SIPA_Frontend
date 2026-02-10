# Guía de Integración - Autenticación JWT (Angular)

## Base URL

```
http://localhost:5000/api
```

---

## Endpoints de Autenticación

### 1. Login

**POST** `/auth/login`

**Request:**
```json
{
  "email": "admin@pavis.com",
  "password": "Admin123!"
}
```

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Administrador del Sistema",
      "email": "admin@pavis.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "avatarColor": "#EF4444",
      "projectsAssigned": 0
    }
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Contraseña incorrecta",
  "data": null
}
```

---

### 2. Register

**POST** `/auth/register`

**Headers:** Ninguno (endpoint público)

**Request:**
```json
{
  "name": "Nuevo Usuario",
  "email": "nuevo@pavis.com",
  "password": "Password123!",
  "role": "ASESOR"
}
```

**Roles válidos:** `ADMIN`, `ASESOR`, `SPAT`, `ORGANIZACION`, `CONSULTA`

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Nuevo Usuario",
      "email": "nuevo@pavis.com",
      "role": "ASESOR",
      "status": "ACTIVE",
      "avatarColor": "#3B82F6",
      "projectsAssigned": 0
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "data": null
}
```

---

### 3. Validate Token

**POST** `/auth/validate`

**Headers:** Ninguno (endpoint público)

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Token válido",
  "data": true
}
```

**Response Error (200 pero data=false):**
```json
{
  "success": true,
  "message": "Token inválido",
  "data": false
}
```

---

### 4. Restore Password (Solo ADMIN)

**POST** `/auth/restore-password`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request:**
```json
{
  "email": "asesor@pavis.com"
}
```

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Contraseña restaurada exitosamente",
  "data": {
    "email": "asesor@pavis.com",
    "temporaryPassword": "$^H9fJ%mZB0i",
    "message": "Se ha enviado un correo a asesor@pavis.com con la contraseña temporal."
  }
}
```

**Nota:** En desarrollo, el correo se captura en MailHog (http://localhost:8025). En producción, el usuario recibirá el correo real.

**Response Error (401):**
```json
{
  "success": false,
  "message": "Usuario no encontrado o inactivo",
  "data": null
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "No tiene permisos para realizar esta acción",
  "data": null
}
```

---

## Claims del Token JWT

```json
{
  "sub": "user-uuid",
  "email": "user@email.com",
  "unique_name": "User Name",
  "role": "ADMIN",
  "jti": "token-id",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "Pavis.Api",
  "aud": "Pavis.Client"
}
```

---

## Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `ADMIN` | Administrador del Sistema | Todos los endpoints |
| `ASESOR` | Asesor Técnico | Proyectos asignados, evaluaciones |
| `SPAT` | Equipo SPAT | Gestión de proyectos SPAT |
| `ORGANIZACION` | Organización/Comunidad | Solo sus proyectos |
| `CONSULTA` | Usuario de solo lectura | Consultas, reportes |

---

## Ejemplo de Integración con Angular

### Servicio de Autenticación

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      avatarColor: string;
      projectsAssigned: number;
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private tokenKey = 'pavis_token';
  private currentUserSubject = new BehaviorSubject<any>(null);
  
  constructor(private http: HttpClient) {
    // Cargar usuario del localStorage al iniciar
    const token = this.getToken();
    if (token) {
      this.currentUserSubject.next(this.decodeToken(token));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setToken(response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  register(name: string, email: string, password: string, role: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, {
      name, email, password, role
    });
  }

  validateToken(token: string): Observable<{ success: boolean; data: boolean }> {
    return this.http.post<{ success: boolean; data: boolean }>(
      `${this.apiUrl}/validate`, 
      { token }
    );
  }

  restorePassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore-password`, { email });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar expiración
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    
    return decoded.exp * 1000 > Date.now();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  }
}
```

### Interceptor de HTTP

```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

### Guard de Autenticación

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Guard de Roles

```typescript
// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();
    
    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }
    
    if (requiredRoles.includes(userRole)) {
      return true;
    }
    
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

### Uso en Componentes

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="login()">
      <input type="email" [(ngModel)]="email" name="email" required>
      <input type="password" [(ngModel)]="password" name="password" required>
      <button type="submit">Login</button>
    </form>
    <div *ngIf="error" class="error">{{ error }}</div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}
```

### Configuración de Rutas

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'projects', 
    component: ProjectsComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ASESOR', 'SPAT'] }
  }
];
```

---

## Seguridad

- **Contraseñas:** Hasheadas con BCrypt
- **Token:** Expira en 15 minutos
- **Clave Secreta:** Mínimo 32 caracteres
- **Validación:** En cada request protegido
- **HTTPS:** Requerido en producción

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 400 | Bad Request (datos inválidos) |
| 401 | Unauthorized (no autenticado) |
| 403 | Forbidden (no tiene permisos) |
| 404 | Not Found |
| 500 | Error interno del servidor |

---

## Usuarios de Prueba

Ver archivo: `TEST_USERS.md`

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@pavis.com | Admin123! | ADMIN |
| asesor@pavis.com | Asesor123! | ASESOR |
| spat@pavis.com | Spat123! | SPAT |
| org@pavis.com | Org123! | ORGANIZACION |
