-- ============================================================================
-- DynaPro - Script Exclusivo de INSERTS / SEEDS para Supabase (PostgreSQL)
-- Centro Latinoamericano de Especies Menores (SENA CLEM - Tuluá)
-- ============================================================================

-- 1. DEPARTAMENTOS
INSERT INTO departments (id, name, code) VALUES
(1, 'Valle del Cauca', '76'),
(2, 'Antioquia', '05'),
(3, 'Distrito Capital', '11'),
(4, 'Caldas', '17'),
(5, 'Santander', '68')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. CIUDADES / MUNICIPIOS
INSERT INTO cities (id, department_id, name, code) VALUES
(1, 1, 'Guadalajara de Buga', '76111'),
(2, 1, 'Cali', '76001'),
(3, 1, 'Palmira', '76520'),
(4, 1, 'Tuluá', '76834'),
(5, 2, 'Medellín', '05001'),
(6, 2, 'Rionegro', '05615'),
(7, 3, 'Bogotá D.C.', '11001'),
(8, 4, 'Manizales', '17001'),
(9, 5, 'Bucaramanga', '68001')
ON CONFLICT (id) DO UPDATE SET department_id = EXCLUDED.department_id, name = EXCLUDED.name, code = EXCLUDED.code;

-- 3. CENTROS DE FORMACIÓN SENA
INSERT INTO training_centers (id, code, name, city_id, regional_name) VALUES
(1, 'CLEM-9201', 'CLEM - Centro Latinoamericano de Especies Menores', 1, 'Valle del Cauca'),
(2, 'AGRO-4412', 'Centro Agroempresarial y Acuícola', 3, 'Valle del Cauca'),
(3, 'TECN-1088', 'Centro de Tecnologías de la Información y las Comunicaciones', 2, 'Valle del Cauca'),
(4, 'INNO-7004', 'Centro de Innovación SENA Nodo 4', 5, 'Antioquia')
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, name = EXCLUDED.name, city_id = EXCLUDED.city_id, regional_name = EXCLUDED.regional_name;

-- 4. FICHAS DE FORMACIÓN / GRUPOS
INSERT INTO training_groups (id, number, training_program, schedule, status, training_center_id, created_at) VALUES
(1, '2345678', 'ADSO - Análisis y Desarrollo de Software', 'DIURNA', 'Activo', 1, '2023-01-15 00:00:00+00'),
(2, '2345679', 'ADSO - Análisis y Desarrollo de Software', 'NOCTURNA', 'Activo', 1, '2023-02-10 00:00:00+00'),
(3, '2345680', 'TPSI - Tecnólogo en Producción de Sistemas de Información', 'MIXTA', 'Inactivo', 1, '2022-08-01 00:00:00+00'),
(4, '2451290', 'Tecnología en Producción Agropecuaria Ecológica', 'DIURNA', 'Activo', 1, '2023-03-20 00:00:00+00'),
(5, '2589340', 'Control Ambiental y Sostenibilidad', 'MIXTA', 'Activo', 1, '2023-04-12 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  number = EXCLUDED.number,
  training_program = EXCLUDED.training_program,
  schedule = EXCLUDED.schedule,
  status = EXCLUDED.status,
  training_center_id = EXCLUDED.training_center_id;

-- 5. USUARIOS INSTITUCIONALES
INSERT INTO users (id, document_type, document, full_name, email, phone, role, status, created_at) VALUES
(1, 'CC', '1023456789', 'Ana Martínez', 'amartinez@sena.edu.co', '+57 300 123 4567', 'ADMINISTRADOR', 'Activo', '2023-01-10 00:00:00+00'),
(2, 'CC', '9876543210', 'Carlos Ramírez', 'cramirez@misena.edu.co', '+57 311 555 7890', 'INSTRUCTOR', 'Activo', '2023-02-14 00:00:00+00'),
(3, 'TI', '1122334455', 'Laura Gómez', 'lgomez@misena.edu.co', '+57 315 444 3322', 'APRENDIZ', 'Inactivo', '2023-03-01 00:00:00+00'),
(4, 'CC', '52345678', 'Dra. María Elena Gómez', 'mgomez@sena.edu.co', '+57 310 987 6543', 'INSTRUCTOR', 'Activo', '2022-11-20 00:00:00+00'),
(5, 'CC', '1005678901', 'Juan Pérez', 'jperez@misena.edu.co', '+57 320 111 2233', 'APRENDIZ', 'Activo', '2023-01-25 00:00:00+00'),
(6, 'CC', '71234567', 'Ing. Carlos Rodríguez', 'crodriguez@sena.edu.co', '+57 301 777 8899', 'INSTRUCTOR', 'Activo', '2023-02-05 00:00:00+00'),
(7, 'CC', '1032456789', 'Ana López', 'alopez@sena.edu.co', '+57 318 333 4455', 'INSTRUCTOR', 'Activo', '2023-01-05 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  document_type = EXCLUDED.document_type,
  document = EXCLUDED.document,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 6. PROYECTOS DE INVESTIGACIÓN (TRD)
INSERT INTO projects (
  id, name, training_center_id, training_center_name, regional_name, beneficiaries, executive_summary,
  keywords, general_objective, specific_objectives, start_date, end_date, total_budget,
  status, progress, created_by_user_id, is_deleted, created_at, updated_at
) VALUES
(
  1,
  'Desarrollo de Bioplásticos a partir de Residuos de Cacao',
  2,
  'Centro Agroempresarial',
  'Valle del Cauca',
  'Instructores, aprendices de agroindustria y productores cacaoteros de la región Valle del Cauca.',
  'Investigación orientada al aprovechamiento de la cascarilla y mucílago de cacao para la síntesis de biopolímeros biodegradables compostables, reduciendo la huella de carbono en empaques agrícolas.',
  '["Bioplásticos", "Economía Circular", "Cacao", "Sostenibilidad", "Biopolímeros"]'::jsonb,
  'Sintetizar y caracterizar películas biodegradables a partir del almidón y celulosa extraídos de los residuos agroindustriales del cacao.',
  '["Extraer y purificar celulosa a partir de la cáscara de cacao.", "Formular matrices poliméricas con plastificantes naturales.", "Evaluar la tasa de biodegradabilidad en suelos del centro de formación."]'::jsonb,
  '2024-02-01',
  '2024-11-30',
  35000000.00,
  'EN EJECUCIÓN',
  65,
  4,
  false,
  '2024-01-20 00:00:00+00',
  '2024-05-15 00:00:00+00'
),
(
  2,
  'Sistema IoT para Monitoreo de Calidad del Agua en Acuicultura',
  3,
  'Centro de Tecnología',
  'Valle del Cauca',
  'Piscicultores de especies menores y centros acuícolas del SENA.',
  'Diseño e implementación de una red de sensores sumergibles con microcontroladores ESP32 para telemetría en tiempo real de pH, oxígeno disuelto y temperatura con alertas tempranas vía LoRaWAN.',
  '["IoT", "Acuicultura", "Sensores", "Telemetría", "Sistemas Embebidos"]'::jsonb,
  'Desarrollar un prototipo de monitoreo continuo multiparamétrico para estanques piscícolas.',
  '["Diseñar la circuitería electrónica y sondas de calibración.", "Configurar el protocolo de comunicación inalámbrica de bajo consumo.", "Desplegar un panel de control con visualización web y móvil."]'::jsonb,
  '2023-05-10',
  '2023-12-15',
  28000000.00,
  'INACTIVO',
  15,
  6,
  false,
  '2023-05-01 00:00:00+00',
  '2023-05-01 00:00:00+00'
),
(
  3,
  'Implementación de Energías Renovables en Zonas Rurales Aisladas',
  4,
  'Centro de Innovación',
  'Antioquia',
  'Comunidades rurales no interconectadas y aprendices de energías limpias.',
  'Instalación y evaluación de un microrred fotovoltaica híbrida con almacenamiento en baterías de litio-ferrofosfato para energizar centros comunitarios rurales.',
  '["Energía Solar", "Fotovoltaica", "Zonas No Interconectadas", "Sostenibilidad"]'::jsonb,
  'Evaluar el desempeño técnico y socioeconómico de sistemas fotovoltaicos aislados.',
  '["Dimensionar la capacidad de generación fotovoltaica según la demanda local.", "Capacitar a líderes comunitarios en mantenimiento preventivo.", "Medir la reducción de emisiones de CO2 frente a generadores diésel."]'::jsonb,
  '2024-01-15',
  '2024-10-30',
  52000000.00,
  'EN EJECUCIÓN',
  88,
  2,
  false,
  '2024-01-10 00:00:00+00',
  '2024-01-10 00:00:00+00'
),
(
  4,
  'Evaluación de Sistemas Acuapónicos en Climas Templados',
  1,
  'CLEM - Centro Latinoamericano de Especies Menores',
  'Valle del Cauca',
  'Productores de especies menores y aprendices del CLEM.',
  'Integración simbiótica de cultivo hidropónico de hortalizas con producción acuícola de tilapia roja, optimizando la recirculación de nutrientes y el uso eficiente del agua.',
  '["Acuaponía", "Sostenibilidad", "Tilapia", "Hidroponía", "CLEM"]'::jsonb,
  'Evaluar la eficiencia biológica y productiva de un sistema acuapónico de ciclo cerrado en el centro CLEM.',
  '["Monitorear la tasa de asimilación de nitratos en plantas de lechuga.", "Analizar los costos operativos frente a sistemas agrícolas tradicionales.", "Estandarizar el protocolo de desinfección biológica."]'::jsonb,
  '2024-03-01',
  '2024-12-20',
  42000000.00,
  'ACTIVO',
  40,
  7,
  false,
  '2024-02-28 00:00:00+00',
  '2024-02-28 00:00:00+00'
),
(
  5,
  'Optimización Nutricional en Lombricultura con Subproductos del Café',
  1,
  'CLEM - Centro Latinoamericano de Especies Menores',
  'Valle del Cauca',
  'Asociaciones caficultoras y aprendices de biotecnología agropecuaria.',
  'Evaluación del crecimiento poblacional y calidad de humus de lombriz roja californiana (Eisenia foetida) alimentada con pulpa de café compostada y rumen bovino.',
  '["Lombricultura", "Humus", "Café", "Abono Orgánico", "CLEM"]'::jsonb,
  'Determinar la tasa óptima de enriquecimiento orgánico en lechos de lombricultura.',
  '["Caracterizar físico-químicamente el sustrato de pulpa de café precompostada.", "Medir la tasa reproductiva mensual de Eisenia foetida.", "Cuantificar el contenido de N-P-K en el lixiviado y abono sólido producido."]'::jsonb,
  '2023-08-01',
  '2024-06-30',
  19500000.00,
  'ACTIVO',
  75,
  2,
  false,
  '2023-07-25 00:00:00+00',
  '2023-07-25 00:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  training_center_id = EXCLUDED.training_center_id,
  training_center_name = EXCLUDED.training_center_name,
  regional_name = EXCLUDED.regional_name,
  beneficiaries = EXCLUDED.beneficiaries,
  executive_summary = EXCLUDED.executive_summary,
  keywords = EXCLUDED.keywords,
  general_objective = EXCLUDED.general_objective,
  specific_objectives = EXCLUDED.specific_objectives,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  total_budget = EXCLUDED.total_budget,
  status = EXCLUDED.status,
  progress = EXCLUDED.progress,
  updated_at = EXCLUDED.updated_at;

-- 7. AUTORES POR PROYECTO
INSERT INTO project_authors (id, project_id, user_id, is_principal) VALUES
(1, 1, 4, true),
(2, 1, 5, false),
(3, 2, 6, true),
(4, 3, 2, true),
(5, 3, 7, false),
(6, 4, 7, true),
(7, 4, 5, false),
(8, 5, 2, true)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  user_id = EXCLUDED.user_id,
  is_principal = EXCLUDED.is_principal;

-- 8. FICHAS VINCULADAS POR PROYECTO
INSERT INTO project_training_groups (id, project_id, training_group_id) VALUES
(1, 1, 4),
(2, 2, 1),
(3, 3, 5),
(4, 4, 4),
(5, 5, 4)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  training_group_id = EXCLUDED.training_group_id;

-- 9. ANEXOS DOCUMENTALES DE PROYECTO
INSERT INTO project_attachments (id, project_id, file_name, file_size, file_type, data_url, uploaded_at) VALUES
(1, 1, 'propuesta_bioplasticos_cacao_final.pdf', 3565158, 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...', '2024-02-05 00:00:00+00'),
(2, 1, 'cronograma_y_presupuesto_fase1.xlsx', 1258291, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIA...', '2024-02-10 00:00:00+00'),
(3, 2, 'especificaciones_sensores_iot.pdf', 2202009, 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...', '2023-05-12 00:00:00+00'),
(4, 3, 'estudio_factibilidad_fotovoltaica.pdf', 5033164, 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...', '2024-01-20 00:00:00+00'),
(5, 4, 'formato_formulacion_v3.pdf', 2516582, 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...', '2024-03-05 00:00:00+00'),
(6, 5, 'informe_avances_lombricultura.pdf', 1887436, 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...', '2023-08-15 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  file_size = EXCLUDED.file_size,
  file_type = EXCLUDED.file_type;

-- 10. LOGS DE AUDITORÍA Y TRAZABILIDAD
INSERT INTO activity_logs (id, user_id, user_name, user_avatar, action_label, action_type, detail, module, payload, timestamp) VALUES
(1, 1, 'Ana Martínez', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', 'Creación de Usuario', 'user_created', 'Se registró el usuario Carlos Pérez con rol Investigador.', 'Usuarios', NULL, '2023-10-27 10:30:00+00'),
(2, 5, 'Carlos Pérez', NULL, 'Actualización Proyecto', 'project_updated', 'Se modificó el estado de "Proyecto Genoma" a En Progreso.', 'Proyectos', NULL, '2023-10-27 09:15:00+00'),
(3, 3, 'Jorge López', NULL, 'Eliminación Registro', 'project_deleted', 'Se eliminó el dataset obsoleto #4092.', 'Proyectos', NULL, '2023-10-26 16:45:00+00'),
(4, 1, 'Ana Martínez', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', 'Cambio Configuración', 'config_changed', 'Se ajustaron los parámetros de retención de logs a 90 días.', 'Configuración', NULL, '2023-10-26 11:20:00+00')
ON CONFLICT (id) DO UPDATE SET
  action_label = EXCLUDED.action_label,
  detail = EXCLUDED.detail;

-- 11. AJUSTE DE SECUENCIAS AUTO-INCREMENTALES (PostgreSQL)
SELECT setval('training_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM training_groups));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('projects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM projects));
SELECT setval('project_authors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM project_authors));
SELECT setval('project_training_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM project_training_groups));
SELECT setval('project_attachments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM project_attachments));
SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs));
