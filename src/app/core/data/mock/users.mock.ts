import { User } from '../../models/domain.models';

export const USERS_MOCK: User[] = [
  { 
    id: '1', 
    name: 'Ana Martínez', 
    role: 'ADMIN', 
    email: 'ana.martinez@pavis.gob', 
    status: 'ACTIVE', 
    avatarColor: 'bg-purple-100 text-purple-700' 
  },
  { 
    id: '2', 
    name: 'Carlos Ruiz', 
    role: 'ASESOR', 
    email: 'carlos.ruiz@pavis.gob', 
    projectsAssigned: 8, 
    maxProjects: 10, 
    status: 'ACTIVE', 
    avatarColor: 'bg-green-100 text-green-700' 
  },
  { 
    id: '3', 
    name: 'Lucía Fernández', 
    role: 'SPAT', 
    email: 'lucia.f@pavis.gob', 
    projectsAssigned: 3, 
    maxProjects: 15, 
    status: 'ACTIVE', 
    avatarColor: 'bg-blue-100 text-blue-700' 
  },
  { 
    id: '4', 
    name: 'Jorge Trejo', 
    role: 'CONSULTA', 
    email: 'jorge.trejo@muni.gob', 
    status: 'INACTIVE', 
    avatarColor: 'bg-gray-100 text-gray-600' 
  },
  { 
    id: '5', 
    name: 'María Gómez', 
    role: 'ASESOR', 
    email: 'maria.gomez@pavis.gob', 
    projectsAssigned: 10, 
    maxProjects: 10, 
    status: 'ACTIVE', 
    avatarColor: 'bg-green-100 text-green-700' 
  },
];
