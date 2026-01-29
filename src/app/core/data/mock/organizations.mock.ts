import { Organization } from '../../models/domain.models';

export const ORGANIZATIONS_MOCK: Organization[] = [
  {
    id: '1',
    name: 'Asociación de Productores de Café Villa Rica',
    type: 'COMPANY',
    identifier: '20123456789',
    email: 'contacto@cafevillarica.com',
    status: 'ACTIVE',
    contactName: 'Juan Pérez',
    municipality: 'Villa Rica',
    region: 'Pasco',
    userId: '101'
  },
  {
    id: '2',
    name: 'Cooperativa Agraria Cafetalera La Florida',
    type: 'COMPANY',
    identifier: '20987654321',
    email: 'info@laflorida.pe',
    status: 'ACTIVE',
    contactName: 'Maria Rodriguez',
    municipality: 'Chanchamayo',
    region: 'Junín',
    userId: '102'
  },
  {
    id: '3',
    name: 'Carlos Andrés Segovia',
    type: 'PERSON',
    identifier: '45678901',
    email: 'carlos.segovia@email.com',
    status: 'ACTIVE',
    municipality: 'Satipo',
    region: 'Junín',
    userId: '103'
  },
  {
    id: '4',
    name: 'Asociación de Cacao del VRAEM',
    type: 'COMPANY',
    identifier: '20555666777',
    email: 'cacao.vraem@asociacion.pe',
    status: 'INACTIVE',
    contactName: 'Pedro Castillo',
    municipality: 'Pichari',
    region: 'Cusco',
    userId: '104'
  }
];
