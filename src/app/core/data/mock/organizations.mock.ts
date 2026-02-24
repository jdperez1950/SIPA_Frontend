import { Organization } from '../../models/domain.models';

export const ORGANIZATIONS_MOCK: Organization[] = [
  {
    id: '1',
    name: 'Constructora Bolívar S.A.',
    type: 'COMPANY',
    identifier: '860002503',
    email: 'proyectos@constructorabolivar.com',
    status: 'ACTIVE',
    contactName: 'Carlos Rodríguez',
    municipality: 'Bogotá D.C.',
    region: 'Bogotá D.C.',
    userId: '101'
  },
  {
    id: '2',
    name: 'Fundación Mario Santo Domingo',
    type: 'COMPANY',
    identifier: '890101234',
    email: 'contacto@fmsd.org.co',
    status: 'ACTIVE',
    contactName: 'Ana María Martínez',
    municipality: 'Barranquilla',
    region: 'Atlántico',
    userId: '102'
  },
  {
    id: '3',
    name: 'Jorge Eliécer García',
    type: 'PERSON',
    identifier: '79123456',
    email: 'jorge.garcia@email.com',
    status: 'ACTIVE',
    municipality: 'Medellín',
    region: 'Antioquia',
    userId: '103'
  },
  {
    id: '4',
    name: 'Unión Temporal Vivienda 2024',
    type: 'COMPANY',
    identifier: '901234567',
    email: 'direccion@utvivienda2024.com',
    status: 'INACTIVE',
    contactName: 'Luis Fernando Torres',
    municipality: 'Cali',
    region: 'Valle del Cauca',
    userId: '104'
  },
  {
    id: '5',
    name: 'María Fernanda Valencia',
    type: 'PERSON',
    identifier: '52345678',
    email: 'maria.valencia@arquitectos.com',
    status: 'ACTIVE',
    municipality: 'Bucaramanga',
    region: 'Santander',
    userId: '105'
  }
];
