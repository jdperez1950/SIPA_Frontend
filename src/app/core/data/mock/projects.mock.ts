import { Project, ViabilityScenario } from '../../models/domain.models';

export const PROJECTS_MOCK: Project[] = [
  {
    id: '1',
    code: 'PRJ-2024-001',
    organization: 'Asociación de Productores de Café',
    municipality: 'Villa Rica',
    state: 'Pasco',
    status: 'ACTIVE',
    viabilityStatus: ViabilityScenario.ENABLED,
    advisor: { id: '2', name: 'Carlos Ruiz' },
    progress: { technical: 3, legal: 4, financial: 1, social: 3 }
  },
  {
    id: '2',
    code: 'PRJ-2024-002',
    organization: 'Cooperativa Agraria Selva Central',
    municipality: 'Satipo',
    state: 'Junín',
    status: 'CERTIFIED',
    viabilityStatus: ViabilityScenario.ENABLED,
    advisor: { id: '3', name: 'Lucía Fernández' },
    progress: { technical: 4, legal: 4, financial: 4, social: 4 }
  },
  {
    id: '3',
    code: 'PRJ-2024-003',
    organization: 'Comunidad Campesina San Juan',
    municipality: 'Huancayo',
    state: 'Junín',
    status: 'SUSPENDED',
    viabilityStatus: ViabilityScenario.NO_POSSIBILITY,
    progress: { technical: 1, legal: 0, financial: 0, social: 2 }
  },
  {
    id: '4',
    code: 'PRJ-2024-004',
    organization: 'Asociación de Ganaderos del Sur',
    municipality: 'Ayaviri',
    state: 'Puno',
    status: 'BENEFICIARY',
    viabilityStatus: ViabilityScenario.ENABLED,
    advisor: { id: '2', name: 'Carlos Ruiz' },
    progress: { technical: 4, legal: 4, financial: 4, social: 4 }
  },
  {
    id: '5',
    code: 'PRJ-2024-005',
    organization: 'Mujeres Emprendedoras de la Sierra',
    municipality: 'Cusco',
    state: 'Cusco',
    status: 'ACTIVE',
    viabilityStatus: ViabilityScenario.PRE_ENABLED,
    progress: { technical: 1, legal: 0, financial: 0, social: 0 }
  }
];
