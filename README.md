# SIPA v2 - Frontend (Angular)

Este repositorio contiene el código fuente del Frontend para el **Sistema de Información del Programa de Autogestión de Vivienda (SIPA)** del Ministerio de Vivienda.

El proyecto está construido utilizando **Angular 17+** bajo una arquitectura orientada a características (**Feature-Based Architecture**) y utilizando los últimos estándares del framework (**Standalone Components**, **Signals**).

## 🛠 Stack Tecnológico

- **Framework:** Angular 17+
- **Lenguaje:** TypeScript 5.x
- **Gestión de Estado:** Angular Signals (Nativo)
- **Estilos:** SCSS / Tailwind CSS (según definición de UI Kit)
- **Visualización de Documentos:** `ngx-extended-pdf-viewer` (o similar)
- **Empaquetado:** Docker (Nginx Alpine)

## 📂 Arquitectura del Proyecto

El proyecto sigue una estructura modular donde cada funcionalidad de negocio es autocontenida (`features/`). Se prioriza la separación entre componentes de presentación ("Dumb") y contenedores de lógica ("Smart").

```text
src/
  app/
    ├── core/                  # SINGLETONS: Servicios esenciales cargados una única vez.
    │   ├── auth/              # Lógica de autenticación (JWT, Interceptors, Guards).
    │   ├── models/            # Interfaces globales (Project, Requirement, Evidence).
    │   ├── services/          # Servicios HTTP base (ApiBaseService, ErrorHandling).
    │   └── utils/             # Validadores custom (ej. Validators.requiredFileType).
    │
    ├── shared/                # REUTILIZABLES: Componentes visuales sin lógica de negocio.
    │   ├── ui/                # UI Kit del proyecto.
    │   │   ├── pdf-viewer/    # Wrapper para visualizar evidencias.
    │   │   ├── status-badge/  # Badge visual (Validado, Devuelto, Pendiente).
    │   │   ├── traffic-light/ # Semáforo de prioridades (Urgente, Alerta).
    │   │   └── chat-bubble/   # Burbuja de mensaje para la bitácora de AT.
    │   └── directives/        # Directivas de utilidad (ej. *appHasRole).
    │
    ├── features/              # MÓDULOS DE NEGOCIO: El corazón del SIPA.
    │   ├── dashboard/         # Landing interna, gráficas y KPIs.
    │   │
    │   ├── project-workspace/ # MÓDULO PRINCIPAL DE GESTIÓN.
    │   │   ├── data-access/   # Servicios HTTP específicos (ProjectService).
    │   │   ├── state/         # Gestión de estado reactivo (ProjectStore con Signals).
    │   │   ├── components/    # Componentes específicos de esta feature.
    │   │   │   ├── evidence-uploader/
    │   │   │   ├── advisor-feedback-panel/
    │   │   │   └── requirement-list/
    │   │   └── pages/
    │   │       ├── project-detail-page/  # Vista general del proyecto.
    │   │       └── validation-page/      # Pantalla dividida (PDF vs Formulario).
    │   │
    │   └── admin/             # Gestión de usuarios, roles y reasignaciones.
    │
    ├── layout/                # Estructura base (Header, Sidebar, Main Layout).
    └── app.routes.ts          # Lazy Loading de las features.
```

## 🧠 Patrones de Diseño Implementados

### 1. Standalone Components
No utilizamos `NgModules` (excepto para librerías legacy). Todos los componentes, directivas y pipes son `standalone: true`. Esto facilita el Tree Shaking y la carga diferida (Lazy Loading).

### 2. Gestión de Estado con Signals
Abandonamos `BehaviorSubjects` para el estado de la UI. Usamos **Signals** para reactividad granular y síncrona.

**Store Pattern:** Cada feature compleja (como `project-workspace`) tiene un **Store** (servicio) que mantiene el estado local (ej. lista de requisitos, estado de carga, progreso calculado).

```typescript
// Ejemplo de uso en project.store.ts
readonly progress = computed(() => {
    const total = this.requirements().length;
    const validated = this.requirements().filter(r => r.status === 'VALIDATED').length;
    return (validated / total) * 100;
});
```

### 3. Smart vs. Dumb Components
- **Pages (Smart):** Inyectan servicios/stores, manejan la data y orquestan la vista. (ej. `validation-page`).
- **Components (Dumb):** Solo reciben datos vía `@Input()` y emiten eventos vía `@Output()`. No consultan APIs directamente. (ej. `advisor-feedback-panel`).

### 4. Control de Acceso (RBAC)
El frontend implementa seguridad visual (no sustituye la del backend).
- **Guards:** `AuthGuard`, `RoleGuard` en las rutas.
- **Directiva:** `*appHasRole="['SPAT', 'ASESOR_SUELO']"` para ocultar/mostrar elementos del DOM según el token JWT.

## 🚀 Configuración y Ejecución

### Prerrequisitos
- Node.js v18+
- NPM v10+
- Angular CLI v17+

### Instalación Local

```bash
# Clonar repositorio
git clone <url-repo>

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200` (o el puerto configurado en Docker `8080`).

### Conexión con Backend (.NET)
Configurar el archivo `src/environments/environment.ts` para apuntar a la API local o contenedorizada:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1', // Puerto del Backend .NET
  storageUrl: 'http://localhost:5000/static/' // Ruta para servir PDFs
};
```

## 🐳 Despliegue con Docker

El proyecto está preparado para desplegarse en contenedores Nginx.

```bash
# Construir imagen
docker build -t sipa-frontend .

# Correr contenedor (Mapeado al puerto solicitado a infraestructura)
docker run -d -p 8080:80 sipa-frontend
```

## 🤝 Flujo de Trabajo (Git Flow)

- **Main:** Código listo para producción (Estable).
- **Develop:** Integración de funcionalidades (Ambiente QA).
- **Feature/:** Ramas por funcionalidad.
  - Ejemplo: `feature/validacion-manual`, `feature/reportes-powerbi`.

## 📝 Notas Importantes para Desarrolladores

- **Validación Manual:** La pantalla de `validation-page` usa un layout de pantalla dividida. El visor de PDF a la izquierda no debe recargarse si el asesor cambia de pregunta, solo debe cambiar el source (`src`).
- **Evidencias:** Nunca tratar los PDFs como Base64. Siempre usar URLs firmadas o rutas estáticas proporcionadas por el Backend.
- **Formularios:** Usar siempre **Reactive Forms** tipados (Typed Forms) de Angular.
