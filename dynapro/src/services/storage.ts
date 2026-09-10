import { User, Project, TrainingGroup, TrainingCenter, Department, City, ActivityLog, Attachment, UserRole } from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TRAINING_GROUPS,
  INITIAL_TRAINING_CENTERS,
  INITIAL_DEPARTMENTS,
  INITIAL_CITIES,
  INITIAL_ACTIVITY_LOGS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'dynapro_users_v1',
  PROJECTS: 'dynapro_projects_v1',
  GROUPS: 'dynapro_groups_v1',
  CENTERS: 'dynapro_centers_v1',
  DEPARTMENTS: 'dynapro_departments_v1',
  CITIES: 'dynapro_cities_v1',
  ACTIVITY_LOGS: 'dynapro_activity_logs_v1',
  CURRENT_USER: 'dynapro_current_user_v1'
};

// Helper: normalize string to compare titles without case, spaces or accents
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Local Storage Wrappers
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function getStoredGroups(): TrainingGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_TRAINING_GROUPS));
      return INITIAL_TRAINING_GROUPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRAINING_GROUPS;
  }
}

export function saveGroups(groups: TrainingGroup[]): void {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

export function getStoredTrainingCenters(): TrainingCenter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CENTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(INITIAL_TRAINING_CENTERS));
      return INITIAL_TRAINING_CENTERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRAINING_CENTERS;
  }
}

export function getStoredDepartments(): Department[] {
  return INITIAL_DEPARTMENTS;
}

export function getStoredCities(): City[] {
  return INITIAL_CITIES;
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function addActivityLog(
  user: User,
  actionLabel: string,
  actionType: ActivityLog['action_type'],
  detail: string,
  module: ActivityLog['module'],
  payload?: any
): void {
  const currentLogs = getStoredLogs();
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const newLog: ActivityLog = {
    id: Date.now(),
    user_id: user.id,
    user_name: user.full_name,
    user_avatar: undefined,
    action_label: actionLabel,
    action_type: actionType,
    detail,
    module,
    payload,
    timestamp: formattedDate
  };

  const updated = [newLog, ...currentLogs];
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(updated));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Default to Ana Martínez (Admin) for convenient immediate experience
      const defaultUser = INITIAL_USERS[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS[0];
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// Anti-duplicate title verification (as mandated by PRD TC-03 and TRD Section 4.2)
export function checkDuplicateTitle(title: string, excludeProjectId?: number): boolean {
  const projects = getStoredProjects().filter(p => !p.is_deleted);
  const normalizedTarget = normalizeString(title);

  return projects.some(p => {
    if (excludeProjectId && p.id === excludeProjectId) return false;
    return normalizeString(p.name) === normalizedTarget;
  });
}

// File validation helper (MIME check + 20MB limit)
export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  
  const fileName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: `Formato de archivo no permitido. Solo se aceptan documentos PDF, Word (.doc, .docx) y Excel (.xls, .xlsx).`
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo "${file.name}" supera el tamaño máximo permitido de 20 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    };
  }

  return { valid: true };
}

// Format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
