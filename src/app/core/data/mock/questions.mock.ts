import { QuestionDefinition } from '../../models/question.models';

export const MOCK_QUESTIONS: QuestionDefinition[] = [
  // 1. Response with file (evidence required)
  {
    id: 'q1',
    axisId: 'SOCIAL',
    order: 1,
    text: 'Describa el impacto social del proyecto y adjunte el estudio correspondiente.',
    helpText: 'Debe incluir un análisis detallado de la población beneficiaria.',
    controlType: 'TEXT_AREA',
    requiresEvidence: true,
    evidenceConfig: {
      maxSizeMb: 5,
      allowedFormats: ['.pdf', '.docx'],
      requiresExpirationDate: false
    }
  },
  // 2. Response without file
  {
    id: 'q2',
    axisId: 'SOCIAL',
    order: 2,
    text: 'Justifique la elección del municipio para la ejecución del proyecto.',
    controlType: 'TEXT_AREA',
    requiresEvidence: false
  },
  // 3. Select (Single Select)
  {
    id: 'q3',
    axisId: 'TECNICO',
    order: 3,
    text: '¿El proyecto cuenta con disponibilidad de servicios públicos?',
    controlType: 'SINGLE_SELECT',
    options: [
      { label: 'Sí, total', value: 'SI_TOTAL' },
      { label: 'Sí, parcial', value: 'SI_PARCIAL' },
      { label: 'No', value: 'NO' }
    ],
    requiresEvidence: false
  },
  // 4. Checkbox (Multi Select) with file
  {
    id: 'q4',
    axisId: 'TECNICO',
    order: 4,
    text: 'Seleccione los estudios técnicos disponibles y adjunte los documentos.',
    controlType: 'MULTI_SELECT',
    options: [
      { label: 'Topográfico', value: 'TOPOGRAFICO' },
      { label: 'Suelos', value: 'SUELOS' },
      { label: 'Estructural', value: 'ESTRUCTURAL' },
      { label: 'Hidrosanitario', value: 'HIDROSANITARIO' }
    ],
    requiresEvidence: true,
    evidenceConfig: {
      maxSizeMb: 10,
      allowedFormats: ['.pdf', '.zip'],
      requiresExpirationDate: true
    }
  },
  // 5. Checkbox (Multi Select) without file
  {
    id: 'q5',
    axisId: 'JURIDICO',
    order: 5,
    text: 'Seleccione las licencias que ya han sido tramitadas.',
    controlType: 'MULTI_SELECT',
    options: [
      { label: 'Construcción', value: 'CONSTRUCCION' },
      { label: 'Urbanismo', value: 'URBANISMO' },
      { label: 'Ambiental', value: 'AMBIENTAL' }
    ],
    requiresEvidence: false
  }
];
