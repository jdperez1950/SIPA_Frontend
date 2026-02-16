import { QuestionDefinition } from '../../models/question.models';

export const MOCK_QUESTIONS: QuestionDefinition[] = [
  // 1. Response with file (evidence required) - HAB Example
  {
    id: 'q1', // Identificador único de la pregunta en la base de datos
    axisId: 'HABITABILIDAD', // ID del eje temático al que pertenece (ej. SOCIAL, TECNICO, JURIDICO)
    code: 'HAB', // Código corto visual para mostrar en el frontend (ej. HAB, SOC, TEC)
    order: 1, // Orden secuencial de la pregunta dentro del cuestionario
    text: '¿La norma de uso del suelo establecido en el POT / PBOT o EOT permite el desarrollo de vivienda en los predios que componen el terreno del proyecto a formular?', // Texto principal de la pregunta
    description: 'El concepto de norma urbanística es el dictamen escrito por medio del cual el curador urbano, la autoridad municipal o distrital competente para expedir licencias o la oficina de planeación o la que haga sus veces, informa al interesado sobre las normas urbanísticas y demás vigentes aplicables a un predio que va a ser construido o intervenido. artículo 2.2.6.1.3.1. del Decreto 1077 de 2015', // Contexto legal, técnico o explicativo detallado que aparece bajo la pregunta
    category: 'Viabilidad / Norma urbanística', // Categoría principal de clasificación del requisito
    subcategory: 'Uso de vivienda', // Subcategoría o etiqueta específica del requisito
    controlType: 'SINGLE_SELECT', // Tipo de control de UI: SINGLE_SELECT (Radio), MULTI_SELECT (Checkbox), TEXT_AREA, DATE
    options: [ // Lista de opciones disponibles si el control es de selección
      { label: 'Sí', value: 'SI' },
      { label: 'No', value: 'NO' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'No sé', value: 'NO_SE' }
    ],
    feedback: [ // Mensajes condicionales que aparecen según la respuesta seleccionada
      { 
        matchValue: 'SI', // Valor de respuesta que activa este mensaje
        text: 'Si el terreno del proyecto cuenta con la viabilidad del uso de vivienda desde la norma establecida en el POT/PBOT o EOT Vigente.' 
      },
      { 
        matchValue: 'NO', 
        text: 'El proyecto no es viable si el uso del suelo no permite vivienda.' 
      },
      { 
        matchValue: 'EN_PROCESO', 
        text: 'Asegúrese de contar con la viabilidad antes de la fase de ejecución.' 
      },
      { 
        matchValue: 'NO_SE', 
        text: 'Es necesario consultar la norma urbanística vigente.' 
      }
    ],
    requiresEvidence: true, // Booleano que indica si esta pregunta requiere subir archivos adjuntos
    requiredDocuments: [ // Lista de documentos específicos que se solicitan (solo si requiresEvidence es true)
      {
        id: 'doc_uso_suelo', // ID único del requisito documental
        name: '1. Certificado de Uso del Suelo', // Nombre visible del documento solicitado
        description: 'Según la norma del POT, PBOT e EOT. Debe incluir clasificación del suelo.', // Descripción o instrucciones para este documento
        required: true, // Si es obligatorio subir este documento específico para completar la pregunta
        multiple: false // Si permite subir múltiples archivos para este mismo requisito (ej. planos)
      },
      {
        id: 'doc_norma_edificabilidad',
        name: '2. Norma de Usos y Edificabilidad',
        description: 'Identificación clara de la norma aplicable al predio.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_afectaciones_ambientales',
        name: '3. Identificación de Afectaciones Ambientales',
        description: 'Certificado de la autoridad ambiental competente.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_afectaciones_riesgos',
        name: '4. Identificación de Afectaciones por Riesgos',
        description: 'Concepto técnico de riesgos.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_patrimonio',
        name: '5. Identificación de Afectaciones Patrimonio',
        description: 'Si aplica, certificado del ministerio de cultura o entidad local.',
        required: false, // Ejemplo de documento opcional
        multiple: false
      },
      {
        id: 'doc_servicios_publicos',
        name: '6. Viabilidad de Servicios Públicos',
        description: 'Cartas de disponibilidad de servicios básicos.',
        required: true,
        multiple: true // Ejemplo de documento que permite múltiples archivos
      },
      {
        id: 'doc_titulos_propiedad',
        name: '7. Títulos de Propiedad',
        description: 'Certificado de libertad y tradición reciente.',
        required: true,
        multiple: false
      }
    ],
    evidenceConfig: { // Configuración técnica para la subida de archivos
      maxSizeMb: 5, // Tamaño máximo permitido por archivo en MB
      allowedFormats: ['.pdf', '.docx'], // Extensiones permitidas
      requiresExpirationDate: false // Si se debe solicitar fecha de vencimiento del documento (no implementado en UI aún)
    }
  },
  // 2. SOCIAL - Impacto Social
  {
    id: 'q2',
    axisId: 'SOCIAL',
    code: 'SOC',
    order: 2,
    text: '¿El proyecto contempla un plan de gestión social para mitigar los impactos en la comunidad?',
    description: 'El plan de gestión social debe incluir estrategias de comunicación, participación comunitaria y manejo de posibles conflictos derivados de la ejecución de la obra.',
    category: 'Impacto Social',
    subcategory: 'Gestión Comunitaria',
    controlType: 'SINGLE_SELECT',
    options: [
      { label: 'Sí', value: 'SI' },
      { label: 'No', value: 'NO' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'No sé', value: 'NO_SE' }
    ],
    feedback: [
      { 
        matchValue: 'SI', 
        text: 'Es fundamental contar con el soporte documental del plan social aprobado.' 
      },
      { 
        matchValue: 'NO', 
        text: 'Sin un plan social, el proyecto podría enfrentar oposición comunitaria y retrasos.' 
      },
      { 
        matchValue: 'EN_PROCESO', 
        text: 'Debe finalizarse antes del inicio de obras.' 
      },
      { 
        matchValue: 'NO_SE', 
        text: 'Verifique con el equipo social del proyecto.' 
      }
    ],
    requiresEvidence: true,
    requiredDocuments: [
      {
        id: 'doc_plan_social',
        name: 'Plan de Gestión Social',
        description: 'Documento completo con caracterización y matriz de impactos.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_cronograma_social',
        name: 'Cronograma de Actividades',
        description: 'Cronograma detallado de socialización y actas.',
        required: false,
        multiple: false
      }
    ],
    evidenceConfig: {
      maxSizeMb: 10,
      allowedFormats: ['.pdf'],
      requiresExpirationDate: false
    }
  },
  // 3. TECNICO - Servicios Públicos
  {
    id: 'q3',
    axisId: 'TECNICO',
    code: 'TEC',
    order: 3,
    text: '¿El proyecto cuenta con disponibilidad certificada de servicios públicos (Acueducto, Alcantarillado, Energía)?',
    description: 'La disponibilidad de servicios públicos es el documento emitido por las empresas prestadoras que garantiza la capacidad técnica para suministrar los servicios demandados por el proyecto.',
    category: 'Viabilidad Técnica',
    subcategory: 'Servicios Públicos',
    controlType: 'SINGLE_SELECT',
    options: [
      { label: 'Sí', value: 'SI' },
      { label: 'No', value: 'NO' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'No sé', value: 'NO_SE' }
    ],
    feedback: [
      { 
        matchValue: 'SI', 
        text: 'Verifique que las certificaciones estén vigentes.' 
      },
      { 
        matchValue: 'NO', 
        text: 'No es posible licenciar el proyecto sin servicios públicos garantizados.' 
      },
      { 
        matchValue: 'EN_PROCESO', 
        text: 'Haga seguimiento prioritario a este trámite ante las ESP.' 
      },
      { 
        matchValue: 'NO_SE', 
        text: 'Consulte con los ingenieros hidrosanitarios y eléctricos.' 
      }
    ],
    requiresEvidence: true,
    requiredDocuments: [
      {
        id: 'doc_acueducto',
        name: 'Disponibilidad de Acueducto y Alcantarillado',
        description: 'Certificado de la ESP correspondiente.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_energia',
        name: 'Disponibilidad de Energía Eléctrica',
        description: 'Certificado de la ESP correspondiente.',
        required: true,
        multiple: false
      }
    ],
    evidenceConfig: {
      maxSizeMb: 5,
      allowedFormats: ['.pdf', '.zip'],
      requiresExpirationDate: true
    }
  },
  // 4. TECNICO - Estudios Técnicos
  {
    id: 'q4',
    axisId: 'TECNICO',
    code: 'TEC',
    order: 4,
    text: '¿Se han completado los estudios de suelos y geotecnia según la NSR-10?',
    description: 'El estudio de suelos determina las características del terreno y las recomendaciones para el diseño de la cimentación, cumpliendo con el Título H de la NSR-10.',
    category: 'Estudios Técnicos',
    subcategory: 'Geotecnia',
    controlType: 'SINGLE_SELECT',
    options: [
      { label: 'Sí', value: 'SI' },
      { label: 'No', value: 'NO' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'No sé', value: 'NO_SE' }
    ],
    feedback: [
      { 
        matchValue: 'SI', 
        text: 'El estudio debe estar firmado por un ingeniero geotécnico con matrícula vigente.' 
      },
      { 
        matchValue: 'NO', 
        text: 'No se puede iniciar el diseño estructural sin este estudio.' 
      },
      { 
        matchValue: 'EN_PROCESO', 
        text: 'Asegúrese de que incluya las recomendaciones de cimentación.' 
      },
      { 
        matchValue: 'NO_SE', 
        text: 'Verifique con el director técnico del proyecto.' 
      }
    ],
    requiresEvidence: true,
    requiredDocuments: [
      {
        id: 'doc_estudio_suelos',
        name: 'Informe de Estudio de Suelos',
        description: 'Informe final firmado por ingeniero especialista.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_memorial_responsabilidad',
        name: 'Memorial de Responsabilidad',
        description: 'Memorial del ingeniero geotécnico.',
        required: true,
        multiple: false
      }
    ],
    evidenceConfig: {
      maxSizeMb: 20,
      allowedFormats: ['.pdf'],
      requiresExpirationDate: false
    }
  },
  // 5. JURIDICO - Licenciamiento
  {
    id: 'q5',
    axisId: 'JURIDICO',
    code: 'JUR',
    order: 5,
    text: '¿El proyecto cuenta con Licencia de Construcción ejecutoriada?',
    description: 'La licencia de construcción es la autorización previa para desarrollar edificaciones, áreas de circulación y zonas comunales en uno o varios predios.',
    category: 'Legal',
    subcategory: 'Licenciamiento',
    controlType: 'SINGLE_SELECT',
    options: [
      { label: 'Sí', value: 'SI' },
      { label: 'No', value: 'NO' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'No sé', value: 'NO_SE' }
    ],
    feedback: [
      { 
        matchValue: 'SI', 
        text: 'Verifique la fecha de vigencia de la licencia.' 
      },
      { 
        matchValue: 'NO', 
        text: 'No se pueden iniciar obras ni ventas sin licencia.' 
      },
      { 
        matchValue: 'EN_PROCESO', 
        text: 'Monitoree los tiempos de respuesta de la Curaduría/Planeación.' 
      },
      { 
        matchValue: 'NO_SE', 
        text: 'Consulte el estado legal del predio.' 
      }
    ],
    requiresEvidence: true,
    requiredDocuments: [
      {
        id: 'doc_resolucion_licencia',
        name: 'Resolución de Licencia',
        description: 'Resolución ejecutoriada expedida por Curaduría o Planeación.',
        required: true,
        multiple: false
      },
      {
        id: 'doc_planos_aprobados',
        name: 'Planos Aprobados',
        description: 'Copia digital de los planos arquitectónicos timbrados.',
        required: true,
        multiple: true
      }
    ],
    evidenceConfig: {
      maxSizeMb: 10,
      allowedFormats: ['.pdf'],
      requiresExpirationDate: true
    }
  }
];
