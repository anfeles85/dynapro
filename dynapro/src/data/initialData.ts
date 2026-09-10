import { Department, City, TrainingCenter, TrainingGroup, User, Project, ActivityLog } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Valle del Cauca' },
  { id: 2, name: 'Antioquia' },
  { id: 3, name: 'Distrito Capital' },
  { id: 4, name: 'Caldas' },
  { id: 5, name: 'Santander' }
];

export const INITIAL_CITIES: City[] = [
  { id: 1, name: 'Guadalajara de Buga', department_id: 1 },
  { id: 2, name: 'Cali', department_id: 1 },
  { id: 3, name: 'Palmira', department_id: 1 },
  { id: 4, name: 'Tuluá', department_id: 1 },
  { id: 5, name: 'Medellín', department_id: 2 },
  { id: 6, name: 'Rionegro', department_id: 2 },
  { id: 7, name: 'Bogotá D.C.', department_id: 3 },
  { id: 8, name: 'Manizales', department_id: 4 },
  { id: 9, name: 'Bucaramanga', department_id: 5 }
];

export const INITIAL_TRAINING_CENTERS: TrainingCenter[] = [
  {
    id: 1,
    code: 'CLEM-9201',
    name: 'CLEM - Centro Latinoamericano de Especies Menores',
    city_id: 1,
    department_name: 'Valle del Cauca',
    city_name: 'Guadalajara de Buga'
  },
  {
    id: 2,
    code: 'AGRO-4412',
    name: 'Centro Agroempresarial y Acuícola',
    city_id: 3,
    department_name: 'Valle del Cauca',
    city_name: 'Palmira'
  },
  {
    id: 3,
    code: 'TECN-1088',
    name: 'Centro de Tecnologías de la Información y las Comunicaciones',
    city_id: 2,
    department_name: 'Valle del Cauca',
    city_name: 'Cali'
  },
  {
    id: 4,
    code: 'INNO-7004',
    name: 'Centro de Innovación SENA Nodo 4',
    city_id: 5,
    department_name: 'Antioquia',
    city_name: 'Medellín'
  }
];

export const INITIAL_TRAINING_GROUPS: TrainingGroup[] = [
  {
    id: 1,
    number: '2345678',
    schedule: 'DIURNA',
    training_program: 'ADSO - Análisis y Desarrollo de Software',
    status: 'Activo',
    training_center_id: 1,
    created_at: '2023-01-15'
  },
  {
    id: 2,
    number: '2345679',
    schedule: 'NOCTURNA',
    training_program: 'ADSO - Análisis y Desarrollo de Software',
    status: 'Activo',
    training_center_id: 1,
    created_at: '2023-02-10'
  },
  {
    id: 3,
    number: '2345680',
    schedule: 'MIXTA',
    training_program: 'TPSI - Tecnólogo en Producción de Sistemas de Información',
    status: 'Inactivo',
    training_center_id: 1,
    created_at: '2022-08-01'
  },
  {
    id: 4,
    number: '2451290',
    schedule: 'DIURNA',
    training_program: 'Tecnología en Producción Agropecuaria Ecológica',
    status: 'Activo',
    training_center_id: 1,
    created_at: '2023-03-20'
  },
  {
    id: 5,
    number: '2589340',
    schedule: 'MIXTA',
    training_program: 'Control Ambiental y Sostenibilidad',
    status: 'Activo',
    training_center_id: 1,
    created_at: '2023-04-12'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    document: '1023456789',
    doc_type: 'CC',
    full_name: 'Ana Martínez',
    email: 'amartinez@sena.edu.co',
    phone: '+57 300 123 4567',
    role: 'ADMINISTRADOR',
    status: 'Activo',
    created_at: '2023-01-10'
  },
  {
    id: 2,
    document: '9876543210',
    doc_type: 'CC',
    full_name: 'Carlos Ramírez',
    email: 'cramirez@misena.edu.co',
    phone: '+57 311 555 7890',
    role: 'INSTRUCTOR',
    status: 'Activo',
    created_at: '2023-02-14'
  },
  {
    id: 3,
    document: '1122334455',
    doc_type: 'TI',
    full_name: 'Laura Gómez',
    email: 'lgomez@misena.edu.co',
    phone: '+57 315 444 3322',
    role: 'APRENDIZ',
    status: 'Inactivo',
    created_at: '2023-03-01'
  },
  {
    id: 4,
    document: '52345678',
    doc_type: 'CC',
    full_name: 'Dra. María Elena Gómez',
    email: 'mgomez@sena.edu.co',
    phone: '+57 310 987 6543',
    role: 'INSTRUCTOR',
    status: 'Activo',
    created_at: '2022-11-20'
  },
  {
    id: 5,
    document: '1005678901',
    doc_type: 'CC',
    full_name: 'Juan Pérez',
    email: 'jperez@misena.edu.co',
    phone: '+57 320 111 2233',
    role: 'APRENDIZ',
    status: 'Activo',
    created_at: '2023-01-25'
  },
  {
    id: 6,
    document: '71234567',
    doc_type: 'CC',
    full_name: 'Ing. Carlos Rodríguez',
    email: 'crodriguez@sena.edu.co',
    phone: '+57 301 777 8899',
    role: 'INSTRUCTOR',
    status: 'Activo',
    created_at: '2023-02-05'
  },
  {
    id: 7,
    document: '1032456789',
    doc_type: 'CC',
    full_name: 'Ana López',
    email: 'alopez@sena.edu.co',
    phone: '+57 318 333 4455',
    role: 'INSTRUCTOR',
    status: 'Activo',
    created_at: '2023-01-05'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Desarrollo de Bioplásticos a partir de Residuos de Cacao',
    training_center_id: 2,
    training_center_name: 'Centro Agroempresarial',
    regional_name: 'Valle del Cauca',
    beneficiaries: 'Instructores, aprendices de agroindustria y productores cacaoteros de la región Valle del Cauca.',
    executive_summary: 'Investigación orientada al aprovechamiento de la cascarilla y mucílago de cacao para la síntesis de biopolímeros biodegradables compostables, reduciendo la huella de carbono en empaques agrícolas.',
    keywords: ['Bioplásticos', 'Economía Circular', 'Cacao', 'Sostenibilidad', 'Biopolímeros'],
    general_objective: 'Sintetizar y caracterizar películas biodegradables a partir del almidón y celulosa extraídos de los residuos agroindustriales del cacao.',
    specific_objectives: [
      'Extraer y purificar celulosa a partir de la cáscara de cacao.',
      'Formular matrices poliméricas con plastificantes naturales.',
      'Evaluar la tasa de biodegradabilidad en suelos del centro de formación.'
    ],
    start_date: '2024-02-01',
    end_date: '2024-11-30',
    total_budget: 35000000,
    status: 'EN EJECUCIÓN',
    progress: 65,
    author_ids: [4, 5], // Dra. María Elena Gómez, Juan Pérez
    training_group_ids: [4],
    attachments: [
      {
        id: 'att-101',
        name: 'propuesta_bioplasticos_cacao_final.pdf',
        file_url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        size: '3.4 MB',
        size_bytes: 3565158,
        mime_type: 'application/pdf',
        uploaded_at: '2024-02-05'
      },
      {
        id: 'att-102',
        name: 'cronograma_y_presupuesto_fase1.xlsx',
        file_url: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIA...',
        size: '1.2 MB',
        size_bytes: 1258291,
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploaded_at: '2024-02-10'
      }
    ],
    created_by_user_id: 4,
    created_at: '2024-01-20',
    updated_at: '2024-05-15'
  },
  {
    id: 2,
    name: 'Sistema IoT para Monitoreo de Calidad del Agua en Acuicultura',
    training_center_id: 3,
    training_center_name: 'Centro de Tecnología',
    regional_name: 'Valle del Cauca',
    beneficiaries: 'Piscicultores de especies menores y centros acuícolas del SENA.',
    executive_summary: 'Diseño e implementación de una red de sensores sumergibles con microcontroladores ESP32 para telemetría en tiempo real de pH, oxígeno disuelto y temperatura con alertas tempranas vía LoRaWAN.',
    keywords: ['IoT', 'Acuicultura', 'Sensores', 'Telemetría', 'Sistemas Embebidos'],
    general_objective: 'Desarrollar un prototipo de monitoreo continuo multiparamétrico para estanques piscícolas.',
    specific_objectives: [
      'Diseñar la circuitería electrónica y sondas de calibración.',
      'Configurar el protocolo de comunicación inalámbrica de bajo consumo.',
      'Desplegar un panel de control con visualización web y móvil.'
    ],
    start_date: '2023-05-10',
    end_date: '2023-12-15',
    total_budget: 28000000,
    status: 'INACTIVO',
    progress: 15,
    author_ids: [6], // Ing. Carlos Rodríguez
    training_group_ids: [1],
    attachments: [
      {
        id: 'att-201',
        name: 'especificaciones_sensores_iot.pdf',
        file_url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        size: '2.1 MB',
        size_bytes: 2202009,
        mime_type: 'application/pdf',
        uploaded_at: '2023-05-12'
      }
    ],
    created_by_user_id: 6,
    created_at: '2023-05-01'
  },
  {
    id: 3,
    name: 'Implementación de Energías Renovables en Zonas Rurales Aisladas',
    training_center_id: 4,
    training_center_name: 'Centro de Innovación',
    regional_name: 'Antioquia',
    beneficiaries: 'Comunidades rurales no interconectadas y aprendices de energías limpias.',
    executive_summary: 'Instalación y evaluación de un microrred fotovoltaica híbrida con almacenamiento en baterías de litio-ferrofosfato para energizar centros comunitarios rurales.',
    keywords: ['Energía Solar', 'Fotovoltaica', 'Zonas No Interconectadas', 'Sostenibilidad'],
    general_objective: 'Evaluar el desempeño técnico y socioeconómico de sistemas fotovoltaicos aislados.',
    specific_objectives: [
      'Dimensionar la capacidad de generación fotovoltaica según la demanda local.',
      'Capacitar a líderes comunitarios en mantenimiento preventivo.',
      'Medir la reducción de emisiones de CO2 frente a generadores diésel.'
    ],
    start_date: '2024-01-15',
    end_date: '2024-10-30',
    total_budget: 52000000,
    status: 'EN EJECUCIÓN',
    progress: 88,
    author_ids: [2, 7], // Carlos Ramírez, Ana López
    training_group_ids: [5],
    attachments: [
      {
        id: 'att-301',
        name: 'estudio_factibilidad_fotovoltaica.pdf',
        file_url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        size: '4.8 MB',
        size_bytes: 5033164,
        mime_type: 'application/pdf',
        uploaded_at: '2024-01-20'
      }
    ],
    created_by_user_id: 2,
    created_at: '2024-01-10'
  },
  {
    id: 4,
    name: 'Evaluación de Sistemas Acuapónicos en Climas Templados',
    training_center_id: 1,
    training_center_name: 'CLEM - Centro Latinoamericano de Especies Menores',
    regional_name: 'Valle del Cauca',
    beneficiaries: 'Productores de especies menores y aprendices del CLEM.',
    executive_summary: 'Integración simbiótica de cultivo hidropónico de hortalizas con producción acuícola de tilapia roja, optimizando la recirculación de nutrientes y el uso eficiente del agua.',
    keywords: ['Acuaponía', 'Sostenibilidad', 'Tilapia', 'Hidroponía', 'CLEM'],
    general_objective: 'Evaluar la eficiencia biológica y productiva de un sistema acuapónico de ciclo cerrado en el centro CLEM.',
    specific_objectives: [
      'Monitorear la tasa de asimilación de nitratos en plantas de lechuga.',
      'Analizar los costos operativos frente a sistemas agrícolas tradicionales.',
      'Estandarizar el protocolo de desinfección biológica.'
    ],
    start_date: '2024-03-01',
    end_date: '2024-12-20',
    total_budget: 42000000,
    status: 'ACTIVO',
    progress: 40,
    author_ids: [7, 5], // Ana López, Juan Pérez
    training_group_ids: [4],
    attachments: [
      {
        id: 'att-401',
        name: 'formato_formulacion_v3.pdf',
        file_url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        size: '2.4 MB',
        size_bytes: 2516582,
        mime_type: 'application/pdf',
        uploaded_at: '2024-03-05'
      }
    ],
    created_by_user_id: 7,
    created_at: '2024-02-28'
  },
  {
    id: 5,
    name: 'Optimización Nutricional en Lombricultura con Subproductos del Café',
    training_center_id: 1,
    training_center_name: 'CLEM - Centro Latinoamericano de Especies Menores',
    regional_name: 'Valle del Cauca',
    beneficiaries: 'Asociaciones caficultoras y aprendices de biotecnología agropecuaria.',
    executive_summary: 'Evaluación del crecimiento poblacional y calidad de humus de lombriz roja californiana (Eisenia foetida) alimentada con pulpa de café compostada y rumen bovino.',
    keywords: ['Lombricultura', 'Humus', 'Café', 'Abono Orgánico', 'CLEM'],
    general_objective: 'Determinar la tasa óptima de enriquecimiento orgánico en lechos de lombricultura.',
    specific_objectives: [
      'Caracterizar físico-químicamente el sustrato de pulpa de café precompostada.',
      'Medir la tasa reproductiva mensual de Eisenia foetida.',
      'Cuantificar el contenido de N-P-K en el lixiviado y abono sólido producido.'
    ],
    start_date: '2023-08-01',
    end_date: '2024-06-30',
    total_budget: 19500000,
    status: 'ACTIVO',
    progress: 75,
    author_ids: [2], // Carlos Ramírez
    training_group_ids: [4],
    attachments: [
      {
        id: 'att-501',
        name: 'informe_avances_lombricultura.pdf',
        file_url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        size: '1.8 MB',
        size_bytes: 1887436,
        mime_type: 'application/pdf',
        uploaded_at: '2023-08-15'
      }
    ],
    created_by_user_id: 2,
    created_at: '2023-07-25'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Ana Martínez',
    user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    action_label: 'Creación de Usuario',
    action_type: 'user_created',
    detail: 'Se registró el usuario Carlos Pérez con rol Investigador.',
    module: 'Usuarios',
    timestamp: '2023-10-27 10:30 AM'
  },
  {
    id: 2,
    user_id: 5,
    user_name: 'Carlos Pérez',
    action_label: 'Actualización Proyecto',
    action_type: 'project_updated',
    detail: 'Se modificó el estado de "Proyecto Genoma" a En Progreso.',
    module: 'Proyectos',
    timestamp: '2023-10-27 09:15 AM'
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Jorge López',
    action_label: 'Eliminación Registro',
    action_type: 'project_deleted',
    detail: 'Se eliminó el dataset obsoleto #4092.',
    module: 'Proyectos',
    timestamp: '2023-10-26 16:45 PM'
  },
  {
    id: 4,
    user_id: 1,
    user_name: 'Ana Martínez',
    user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    action_label: 'Cambio Configuración',
    action_type: 'config_changed',
    detail: 'Se ajustaron los parámetros de retención de logs a 90 días.',
    module: 'Configuración',
    timestamp: '2023-10-26 11:20 AM'
  }
];
