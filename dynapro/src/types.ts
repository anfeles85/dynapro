export type UserRole = 'ADMINISTRADOR' | 'INSTRUCTOR' | 'APRENDIZ';
export type ProjectStatus = 'EN EJECUCIÓN' | 'ACTIVO' | 'INACTIVO' | 'CANCELADO';
export type GroupSchedule = 'DIURNA' | 'MIXTA' | 'NOCTURNA';
export type UserStatus = 'Activo' | 'Inactivo';
export type DocumentType = 'CC' | 'TI' | 'CE' | 'PEP' | 'Cédula de Ciudadanía' | 'Tarjeta de Identidad' | 'Cédula de Extranjería' | 'Pasaporte';

export interface User {
  id: number;
  document: string;
  doc_type?: DocumentType;
  document_type?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  is_deleted?: boolean;
}

export interface Department {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  department_id: number;
}

export interface TrainingCenter {
  id: number;
  name: string;
  city_id: number;
  code?: string;
  department_name?: string;
  regional_name?: string;
  city_name?: string;
}

export interface TrainingGroup {
  id: number;
  number: string;
  schedule: GroupSchedule;
  training_program: string;
  status: 'Activo' | 'Inactivo';
  training_center_id?: number;
  created_at?: string;
}

export interface Attachment {
  id: string;
  name: string;
  file_url: string;
  storage_path?: string;
  size: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

export interface Project {
  id: number;
  name: string;
  short_name?: string;
  training_center_id: number;
  training_center_name?: string;
  regional_name?: string;
  beneficiaries: string;
  executive_summary: string;
  keywords: string[];
  general_objective: string;
  specific_objectives?: string[];
  start_date: string;
  end_date: string;
  total_budget: number;
  status: ProjectStatus;
  progress: number;
  author_ids: number[];
  training_group_ids: number[];
  attachments: Attachment[];
  created_by_user_id: number;
  created_at: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export type ActionType = 
  | 'user_created' 
  | 'user_updated' 
  | 'user_status' 
  | 'project_created' 
  | 'project_updated' 
  | 'project_status' 
  | 'project_deleted' 
  | 'group_created' 
  | 'group_updated' 
  | 'config_changed'
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'ESTADO'
  | 'LOGIN';

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  action_label: string;
  action_type: ActionType;
  detail: string;
  module: 'Usuarios' | 'Proyectos' | 'Grupos' | 'Centros' | 'Configuración' | 'Sistema' | 'Autenticación';
  payload?: any;
  timestamp: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'projects'
  | 'new-project'
  | 'edit-project'
  | 'users'
  | 'new-user'
  | 'edit-user'
  | 'groups'
  | 'new-group'
  | 'edit-group'
  | 'centers'
  | 'new-center'
  | 'edit-center'
  | 'profile'
  | 'activity-log'
  | 'login'
  | 'forgot-password'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'faq'
  | 'case-studies'
  | '404';

