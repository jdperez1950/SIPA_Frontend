# Propuesta de Arquitectura: Gestión de Usuarios y Equipos de Proyecto

## 1. Contexto y Problemática Actual
Actualmente existe la necesidad de asignar "Equipos de Respuesta" a los proyectos (Paso 2 del Wizard de Proyectos). Estos miembros del equipo eventualmente necesitarán iniciar sesión para gestionar evidencias y responder formularios.

**Riesgo:** Crear tablas separadas para "Usuarios del Sistema" y "Usuarios de Proyectos" (Antipatrón *Split Authentication*) causaría:
*   Duplicidad de credenciales.
*   Dificultad para que un mismo usuario tenga múltiples roles (ej: ser Admin en una org y Responsable en otra).
*   Complejidad en la gestión de sesiones y seguridad.

## 2. Solución Propuesta: Identidad Unificada
Se propone mantener una **Tabla Única de Usuarios** para la autenticación, y manejar los datos adicionales y las relaciones mediante tablas satélite y de enlace.

### Principios
1.  **Identidad Única:** Un email = Un Usuario (Login).
2.  **Roles Contextuales:** El rol de "Responsable" o "Líder" se da en el contexto de un Proyecto, no necesariamente como rol global del sistema.
3.  **Perfil Extendido:** Los datos demográficos (teléfono, documento) se separan de la cuenta de usuario básica.

---

## 3. Esquema de Base de Datos Sugerido

### A. Tabla `Users` (Existente/Base)
Tabla central para autenticación.
*   `Id` (PK, GUID)
*   `Email` (Unique)
*   `PasswordHash`
*   `GlobalRole` (Enum: ADMIN, CONSULTANT, USER) - *Rol base del sistema.*
*   `IsActive` (bool)

### B. Tabla `UserProfiles` (Nueva)
Extensión 1:1 para datos personales que no son necesarios para el login, pero sí para el negocio.
*   `Id` (PK, FK -> Users.Id)
*   `FullName` (String)
*   `DocumentType` (String: CC, NIT, CE...)
*   `DocumentNumber` (String)
*   `PhoneNumber` (String)
*   `JobTitle` (String) - *Cargo en la empresa (opcional)*
*   `OrganizationId` (FK -> Organizations.Id, Nullable) - *Si pertenece a una org fija.*

### C. Tabla `ProjectResponseTeam` (Nueva)
Tabla intermedia N:M que define **quién** está en **qué proyecto** y **qué hace**.
*   `Id` (PK)
*   `ProjectId` (FK -> Projects.Id)
*   `UserId` (FK -> Users.Id)
*   `RoleInProject` (String/Enum) - *Ej: "Líder Técnico", "Apoyo Jurídico", "Responsable Financiero".*
*   `AssignedAt` (DateTime)

---

## 4. Lógica de Negocio (Backend Flow)

### Caso de Uso: Asignación de Equipo desde el Wizard (Admin)

Cuando el Frontend envía el payload de creación/edición de proyecto, incluye una lista de miembros del equipo (`responseTeam`).

**Payload de Ejemplo (Frontend -> Backend):**
```json
{
  "projectId": "...",
  "responseTeam": [
    {
      "email": "juan.perez@empresa.com",
      "name": "Juan Perez",
      "roleInProject": "Líder Técnico",
      "phone": "3001234567",
      "documentNumber": "12345678"
    },
    {
      "email": "maria.gomez@empresa.com",
      "name": "Maria Gomez",
      "roleInProject": "Apoyo Jurídico"
    }
  ]
}
```

**Algoritmo "Find or Create" en el Backend:**

Al procesar la lista `responseTeam`:

1.  **Iterar** sobre cada miembro enviado.
2.  **Buscar Usuario:** ¿Existe `Users` con `email == item.email`?
    *   **SÍ Existe:**
        *   Obtener su `UserId`.
        *   *(Opcional)* Actualizar `UserProfiles` con teléfono/documento si vienen en el payload y están vacíos en BD.
    *   **NO Existe:**
        *   **Crear Usuario:** Insertar en `Users`.
            *   `Email`: `item.email`
            *   `Password`: Generar temporal o marcar `EmailVerified = false`.
            *   `GlobalRole`: Asignar rol base (ej: `PROJECT_USER`).
        *   **Crear Perfil:** Insertar en `UserProfiles` con Nombre, Teléfono, Documento.
        *   **Disparar Evento:** Enviar correo de "Bienvenida / Invitación a Proyecto" para que configure su contraseña.
3.  **Crear Relación:**
    *   Insertar/Actualizar en `ProjectResponseTeam`:
        *   `ProjectId`: ID del proyecto actual.
        *   `UserId`: ID del usuario encontrado o creado.
        *   `RoleInProject`: `item.roleInProject`.

---

## 5. Ventajas
*   **Escalabilidad:** Un usuario puede estar en múltiples proyectos sin duplicar sus datos.
*   **Seguridad:** Centraliza la autenticación. Si se inhabilita el usuario en `Users`, pierde acceso a todos los proyectos.
*   **Flexibilidad:** Permite agregar más datos al perfil sin afectar el rendimiento del Login.

# desde aqui 
# Guía de Integración - Frontend

## Resumen de Cambios

Se ha implementado una nueva arquitectura de identidad unificada que simplifica la gestión de usuarios y organizaciones.

### Cambios Principales

1. **Registro simplificado** - Ya no se requiere contraseña en el registro
2. **Creación de usuarios automática** - Al crear un proyecto con equipo, los usuarios se crean automáticamente
3. **Emails automáticos** - Los nuevos usuarios reciben credenciales por email
4. **Unificación de usuarios** - Todos los usuarios están en una sola tabla con perfiles separados

---

## 1. Registro de Usuarios (Cambio Importante)

### Antes
```json
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "Contraseña123!",
  "role": "CONSULTA"
}
```

### Ahora
```json
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "role": "CONSULTA"
}
```

**Nota**: El backend genera automáticamente una contraseña segura y la envía por email al usuario.

---

## 2. Creación de Proyectos con Equipo

### Endpoint
```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json
```

### Estructura del Payload

```json
{
  "name": "Proyecto de Innovación Tecnológica",
  "organization": {
    "name": "Empresa ABC",
    "identifier": "900123456",
    "type": 1,
    "email": "contacto@empresaabc.com",
    "municipality": "Bogotá",
    "region": "Cundinamarca",
    "contactName": "María González",
    "address": "Calle 123 # 45-67",
    "description": "Empresa líder en tecnología"
  },
  "responseTeam": [
    {
      "email": "lider@empresaabc.com",
      "name": "Carlos López",
      "roleInProject": "Líder Técnico",
      "phone": "3001234567",
      "documentNumber": "12345678",
      "documentType": "CC"
    },
    {
      "email": "desarrollador@empresaabc.com",
      "name": "Ana Martínez",
      "roleInProject": "Desarrolladora Senior",
      "phone": "3109876543",
      "documentNumber": "87654321",
      "documentType": "CC"
    }
  ],
  "dates": {
    "start": "2026-02-12",
    "end": "2026-12-31",
    "submissionDeadline": "2026-03-15"
  }
}
```

### Campos Importantes

#### responseTeam (Array)
Cada miembro del equipo debe incluir:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | string | Sí | Email del usuario (usado para login) |
| `name` | string | Sí | Nombre completo del usuario |
| `roleInProject` | string | Sí | Rol específico en el proyecto (ej: "Líder Técnico") |
| `phone` | string | No | Teléfono de contacto |
| `documentNumber` | string | No | Número de documento de identidad |
| `documentType` | string | No | Tipo de documento (CC, CE, NIT, etc.) |

**Comportamiento del backend:**
- Si el email ya existe → El usuario se vincula al proyecto
- Si el email no existe → Se crea un nuevo usuario con contraseña generada automáticamente
- En ambos casos, se envía un email al usuario con sus credenciales

#### organization (Objeto)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre de la organización |
| `identifier` | string | Sí | NIT o identificador único |
| `type` | integer | Sí | 0=EmpresaPrivada, 1=EntidadPublica, 2=OrganizacionSocial, 3=Otro |
| `email` | string | Sí | Email de contacto |
| `municipality` | string | Sí | Ciudad/Municipio |
| `region` | string | Sí | Departamento/Región |
| `contactName` | string | No | Nombre del contacto principal |
| `address` | string | No | Dirección física |
| `description` | string | No | Descripción de la organización |

**Comportamiento del backend:**
- Busca por `identifier` (NIT)
- Si existe → Vincula el proyecto a la organización existente
- Si no existe → Crea la organización y vincula el proyecto

---

## 3. Obtener Equipo de un Proyecto

### Endpoint
```
GET /api/projects/{projectId}/team
Authorization: Bearer {token}
```

### Respuesta
```json
[
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "550e8400-e29b-41d4-a716-446655440001",
    "userEmail": "lider@empresaabc.com",
    "userName": "Carlos López",
    "roleInProject": "Líder Técnico",
    "phone": "3001234567",
    "documentNumber": "12345678",
    "assignedAt": "2026-02-12T17:30:00Z",
    "isExistingUser": true
  }
]
```

---

## 4. Flujo de Creación de Proyecto (Diagrama)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario completa formulario de proyecto                 │
│     └─ Incluye datos de organización                        │
│     └─ Incluye array responseTeam[]                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend envía POST /api/projects                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Backend procesa:                                        │
│     ├─ Busca/Crea organización por NIT                      │
│     ├─ Crea proyecto                                        │
│     └─ Para cada miembro en responseTeam:                   │
│        ├─ Busca usuario por email                           │
│        ├─ Si no existe:                                     │
│        │   ├─ Crea usuario con password aleatorio          │
│        │   ├─ Crea UserProfile                              │
│        │   └─ Envía email de bienvenida                     │
│        └─ Crea ProjectTeamMember (vínculo)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Respuesta exitosa: Proyecto creado                      │
│     └─ Usuarios reciben emails con credenciales             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Manejo de Errores Comunes

### Error 400 - Validación
```json
{
  "errors": [
    "El campo 'organization.identifier' es requerido",
    "El formato del email 'correo-invalido' no es válido",
    "La fecha de inicio debe ser anterior a la fecha de finalización"
  ]
}
```

### Error 401 - No Autorizado
```json
{
  "message": "No autorizado. Token no proporcionado o inválido."
}
```

### Error 403 - Sin Permisos
```json
{
  "message": "No tiene permisos para crear proyectos."
}
```

---

## 6. Consideraciones Importantes

### Seguridad
- El `responseTeam` solo puede ser proporcionado por usuarios con rol `ADMIN` o `ASESOR`
- Los emails de credenciales se envían automáticamente - no mostrar contraseñas en la UI
- Los usuarios pueden cambiar su contraseña después del primer login

### UX Recomendada
1. **Formulario de proyecto**: Permitir agregar múltiples miembros al equipo con un botón "+ Agregar miembro"
2. **Validación en tiempo real**: Verificar formato de emails antes de enviar
3. **Feedback**: Mostrar mensaje de éxito indicando que los usuarios recibirán emails
4. **Organización**: Permitir búsqueda de organizaciones existentes por NIT antes de crear nuevas

### Email de Bienvenida
Los usuarios nuevos recibirán un email con:
- Sus credenciales de acceso (email y contraseña temporal)
- Instrucciones para cambiar la contraseña
- Enlace al sistema (cuando esté disponible)

---

## 7. Ejemplo Completo en JavaScript/React

```javascript
const createProject = async (projectData) => {
  const payload = {
    name: projectData.name,
    organization: {
      name: projectData.organizationName,
      identifier: projectData.nit,
      type: parseInt(projectData.organizationType),
      email: projectData.orgEmail,
      municipality: projectData.municipality,
      region: projectData.region,
      contactName: projectData.contactName,
      address: projectData.address,
      description: projectData.description
    },
    responseTeam: projectData.teamMembers.map(member => ({
      email: member.email,
      name: member.fullName,
      roleInProject: member.role,
      phone: member.phone,
      documentNumber: member.documentNumber,
      documentType: member.documentType
    })),
    dates: {
      start: projectData.startDate,
      end: projectData.endDate,
      submissionDeadline: projectData.submissionDeadline
    }
  };

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear proyecto');
    }

    const result = await response.json();
    
    // Mostrar mensaje de éxito
    showSuccess('Proyecto creado exitosamente. Los miembros del equipo recibirán un email con sus credenciales.');
    
    return result;
  } catch (error) {
    showError(error.message);
    throw error;
  }
};
```

---

## 8. Preguntas Frecuentes

**Q: ¿Qué pasa si un usuario ya existe?**
R: El sistema lo detecta por el email y solo lo vincula al proyecto sin crear duplicados.

**Q: ¿Los usuarios existentes reciben email?**
R: Sí, todos los usuarios asignados a un proyecto reciben notificación por email.

**Q: ¿Puedo modificar el equipo después de crear el proyecto?**
R: Próximamente se agregarán endpoints para agregar/eliminar miembros del equipo.

**Q: ¿Qué roles pueden crear proyectos?**
R: Actualmente solo ADMIN y ASESOR pueden crear proyectos con equipo.

---

## Contacto

Para dudas o problemas con la integración, contactar al equipo de backend.

**Última actualización**: 2026-02-12

