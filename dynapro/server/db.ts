import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TRAINING_GROUPS,
  INITIAL_TRAINING_CENTERS,
  INITIAL_DEPARTMENTS,
  INITIAL_CITIES,
  INITIAL_ACTIVITY_LOGS
} from '../src/data/initialData';

export interface DbStatus {
  connected: boolean;
  type: 'supabase' | 'memory-fallback';
  supabaseUrl?: string;
  error?: string;
  latencyMs?: number;
  tablesCount?: {
    projects: number;
    users: number;
    training_groups: number;
    training_centers: number;
    activity_logs: number;
  };
}

let supabaseClient: SupabaseClient | null = null;
let isConnected = false;
let lastError: string | null = null;

// Memory fallback store (used only when Supabase keys are absent)
let memoryProjects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
let memoryUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
let memoryGroups = JSON.parse(JSON.stringify(INITIAL_TRAINING_GROUPS));
let memoryCenters = JSON.parse(JSON.stringify(INITIAL_TRAINING_CENTERS));
let memoryDepartments = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
let memoryCities = JSON.parse(JSON.stringify(INITIAL_CITIES));
let memoryLogs = JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LOGS));

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  return { url: url.trim(), key: key.trim() };
}

export async function initDatabase(): Promise<boolean> {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    isConnected = false;
    lastError = 'Credenciales de Supabase no configuradas. Agregue SUPABASE_URL y SUPABASE_ANON_KEY en las variables de entorno. Operando en modo seguro en memoria.';
    console.log(`[Supabase] ${lastError}`);
    supabaseClient = null;
    return false;
  }

  try {
    console.log(`[Supabase] Conectando con Supabase Cloud (${url})...`);
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });

    const startTime = Date.now();
    // Test connectivity by querying projects or users
    const { data, error } = await supabaseClient.from('projects').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet in Supabase, we inform the user to run supabase_schema.sql
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        lastError = `Conectado a Supabase pero las tablas no han sido creadas. Ejecute el script 'supabase_schema.sql' en el SQL Editor de Supabase.`;
        console.warn(`[Supabase] ${lastError}`);
        isConnected = true; // Connected to instance, but tables pending
        return true;
      }
      throw error;
    }

    const latency = Date.now() - startTime;
    isConnected = true;
    lastError = null;
    console.log(`[Supabase] ¡Conectado exitosamente con Supabase PostgreSQL! (${latency}ms)`);
    return true;
  } catch (err: any) {
    isConnected = false;
    lastError = `Error de conexión con Supabase: ${err.message || err}`;
    console.warn(`[Supabase] ${lastError}. Operando en modo seguro.`);
    return false;
  }
}

export function getClient(): SupabaseClient | null {
  return isConnected && supabaseClient ? supabaseClient : null;
}

async function autoSeedSupabaseIfEmpty() {
  if (!supabaseClient) return;

  try {
    // Check if training_centers has data
    const { count: centersCount } = await supabaseClient
      .from('training_centers')
      .select('*', { count: 'exact', head: true });

    if (centersCount === 0) {
      console.log('[Supabase] Poblador automático: insertando departamentos y centros...');
      await supabaseClient.from('departments').upsert(INITIAL_DEPARTMENTS);
      await supabaseClient.from('cities').upsert(INITIAL_CITIES);
      await supabaseClient.from('training_centers').upsert(INITIAL_TRAINING_CENTERS);
    }

    // Check if training_groups has data
    const { count: groupsCount } = await supabaseClient
      .from('training_groups')
      .select('*', { count: 'exact', head: true });

    if (groupsCount === 0) {
      console.log('[Supabase] Poblador automático: insertando fichas...');
      const groupsPayload = INITIAL_TRAINING_GROUPS.map((g) => ({
        id: g.id,
        number: g.number,
        training_program: g.training_program,
        schedule: g.schedule,
        status: g.status,
        training_center_id: g.training_center_id || 1
      }));
      await supabaseClient.from('training_groups').upsert(groupsPayload);
    }

    // Check if users has data
    const { count: usersCount } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersCount === 0) {
      console.log('[Supabase] Poblador automático: insertando usuarios iniciales...');
      const usersPayload = INITIAL_USERS.map((u) => ({
        id: u.id,
        document_type: u.document_type || 'Cédula de Ciudadanía',
        document: u.document,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone || null,
        role: u.role,
        status: u.status
      }));
      await supabaseClient.from('users').upsert(usersPayload);
    }

    // Check if projects has data
    const { count: projectsCount } = await supabaseClient
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectsCount === 0) {
      console.log('[Supabase] Poblador automático: insertando proyectos iniciales...');
      for (const p of INITIAL_PROJECTS) {
        await createProjectInSupabase(p);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Aviso en auto-seed (las tablas pueden no existir aún):', err.message);
  }
}

export async function getDbStatus(): Promise<DbStatus> {
  const { url } = getSupabaseConfig();

  if (!supabaseClient || !isConnected) {
    return {
      connected: false,
      type: 'memory-fallback',
      supabaseUrl: url || undefined,
      error: lastError || 'Supabase no inicializado. Usando memoria segura.',
      tablesCount: {
        projects: memoryProjects.length,
        users: memoryUsers.length,
        training_groups: memoryGroups.length,
        training_centers: memoryCenters.length,
        activity_logs: memoryLogs.length
      }
    };
  }

  try {
    const startTime = Date.now();
    const [projRes, userRes, groupRes, centerRes, logRes] = await Promise.all([
      supabaseClient.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabaseClient.from('users').select('*', { count: 'exact', head: true }),
      supabaseClient.from('training_groups').select('*', { count: 'exact', head: true }),
      supabaseClient.from('training_centers').select('*', { count: 'exact', head: true }),
      supabaseClient.from('activity_logs').select('*', { count: 'exact', head: true })
    ]);

    const latency = Date.now() - startTime;

    return {
      connected: true,
      type: 'supabase',
      supabaseUrl: url,
      latencyMs: latency,
      error: lastError || undefined,
      tablesCount: {
        projects: projRes.count ?? memoryProjects.length,
        users: userRes.count ?? memoryUsers.length,
        training_groups: groupRes.count ?? memoryGroups.length,
        training_centers: centerRes.count ?? memoryCenters.length,
        activity_logs: logRes.count ?? memoryLogs.length
      }
    };
  } catch (err: any) {
    return {
      connected: true,
      type: 'supabase',
      supabaseUrl: url,
      error: `Error consultando conteo de tablas: ${err.message}`,
      tablesCount: {
        projects: memoryProjects.length,
        users: memoryUsers.length,
        training_groups: memoryGroups.length,
        training_centers: memoryCenters.length,
        activity_logs: memoryLogs.length
      }
    };
  }
}

// --------------------------------------------------------------------------
// PROYECTOS
// --------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface UploadedAttachmentResult {
  storage_path: string | null;
  public_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

/**
 * Sube o preserva un anexo en el bucket 'project_attachments' de Supabase Storage.
 * Retorna la referencia al archivo guardado en el bucket (storage_path) y su URL pública.
 */
async function uploadAttachmentToBucket(
  projectId: number,
  att: any,
  client: SupabaseClient
): Promise<UploadedAttachmentResult> {
  const fileName = att.file_name || att.name || 'documento_adjunto.pdf';
  let fileSize = Number(att.file_size || att.size_bytes || (typeof att.size === 'number' ? att.size : 0)) || 1024;
  let fileType = att.file_type || att.mime_type || 'application/pdf';
  const dataUrl = att.data_url || att.file_url || '';
  const existingStoragePath = att.storage_path || null;

  // Si ya tiene storage_path y no es un nuevo archivo en base64, mantenemos la referencia existente
  if (existingStoragePath && !dataUrl.startsWith('data:')) {
    const { data: pubData } = client.storage.from('project_attachments').getPublicUrl(existingStoragePath);
    return {
      storage_path: existingStoragePath,
      public_url: pubData?.publicUrl || dataUrl,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType
    };
  }

  // Si viene como base64 desde el formulario cliente, lo subimos al bucket 'project_attachments'
  if (dataUrl.startsWith('data:')) {
    try {
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        fileType = matches[1] || fileType;
        const buffer = Buffer.from(matches[2], 'base64');
        fileSize = buffer.length;

        // Limpiar nombre de archivo para evitar caracteres inválidos en la ruta
        const safeName = fileName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const storagePath = `projects/${projectId}/${timestamp}_${safeName}`;

        console.log(`[Supabase Storage] Subiendo anexo "${fileName}" (${fileSize} bytes) a bucket "project_attachments" en "${storagePath}"...`);

        const { data: uploadData, error: uploadErr } = await client.storage
          .from('project_attachments')
          .upload(storagePath, buffer, {
            contentType: fileType,
            upsert: true
          });

        if (uploadErr) {
          console.warn(`[Supabase Storage] Aviso al subir "${fileName}" a storage: ${uploadErr.message}. Guardando referencia calculada.`);
          const { data: pubData } = client.storage.from('project_attachments').getPublicUrl(storagePath);
          return {
            storage_path: storagePath,
            public_url: pubData?.publicUrl || '',
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType
          };
        }

        const uploadedPath = uploadData?.path || storagePath;
        const { data: pubData } = client.storage.from('project_attachments').getPublicUrl(uploadedPath);

        console.log(`[Supabase Storage] ¡Anexo "${fileName}" subido exitosamente a "project_attachments"! Ref: ${uploadedPath}`);
        return {
          storage_path: uploadedPath,
          public_url: pubData?.publicUrl || '',
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType
        };
      }
    } catch (err: any) {
      console.error(`[Supabase Storage] Error procesando archivo "${fileName}":`, err.message);
    }
  }

  // Fallback para URLs existentes o texto
  return {
    storage_path: existingStoragePath,
    public_url: dataUrl,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType
  };
}

export async function checkTitleDuplicate(title: string, excludeId?: number): Promise<boolean> {
  const cleanTitle = (title || '').trim().toLowerCase();
  if (!cleanTitle) return false;

  const client = getClient();
  if (client) {
    try {
      let query = client.from('projects').select('id, name').eq('is_deleted', false);
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.some((p: any) => (p.name || '').trim().toLowerCase() === cleanTitle);
      }
    } catch {
      // fallback
    }
  }

  return memoryProjects.some(
    (p: any) => (!excludeId || p.id !== excludeId) && (p.name || '').trim().toLowerCase() === cleanTitle
  );
}

export async function getAllProjects(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      // 1. Fetch base projects
      const { data: dbProjects, error: projErr } = await client
        .from('projects')
        .select('*')
        .eq('is_deleted', false)
        .order('id', { ascending: false });

      if (projErr) throw projErr;

      if (dbProjects && dbProjects.length > 0) {
        const projectIds = dbProjects.map((p: any) => Number(p.id));

        // 2. Fetch related data in parallel without relying on PostgREST schema cache relationship
        const [authorsRes, groupsRes, attachmentsRes, allUsers, allGroups] = await Promise.all([
          client.from('project_authors').select('*').in('project_id', projectIds),
          client.from('project_training_groups').select('*').in('project_id', projectIds),
          client.from('project_attachments').select('*').in('project_id', projectIds),
          getAllUsers(),
          getAllGroups()
        ]);

        const authorsByProject = new Map<number, any[]>();
        if (authorsRes.data) {
          for (const pa of authorsRes.data) {
            const pid = Number(pa.project_id);
            if (!authorsByProject.has(pid)) authorsByProject.set(pid, []);
            authorsByProject.get(pid)!.push(pa);
          }
        }

        const groupsByProject = new Map<number, any[]>();
        if (groupsRes.data) {
          for (const ptg of groupsRes.data) {
            const pid = Number(ptg.project_id);
            if (!groupsByProject.has(pid)) groupsByProject.set(pid, []);
            groupsByProject.get(pid)!.push(ptg);
          }
        }

        const attachmentsByProject = new Map<number, any[]>();
        if (attachmentsRes.data) {
          for (const att of attachmentsRes.data) {
            const pid = Number(att.project_id);
            if (!attachmentsByProject.has(pid)) attachmentsByProject.set(pid, []);
            attachmentsByProject.get(pid)!.push(att);
          }
        }

        const userMap = new Map(allUsers.map((u: any) => [Number(u.id), u]));
        const groupMap = new Map(allGroups.map((g: any) => [Number(g.id), g]));

        return dbProjects.map((p: any) => {
          const pid = Number(p.id);
          const pAuthors = authorsByProject.get(pid) || [];
          const pGroups = groupsByProject.get(pid) || [];
          const pAttachments = attachmentsByProject.get(pid) || [];

          const author_ids = pAuthors
            .map((pa: any) => Number(pa.user_id))
            .filter((id: number) => !isNaN(id) && id > 0);

          const training_group_ids = pGroups
            .map((ptg: any) => Number(ptg.training_group_id))
            .filter((id: number) => !isNaN(id) && id > 0);

          const authors = pAuthors.map((pa: any) => {
            const u = userMap.get(Number(pa.user_id));
            if (!u) {
              return {
                id: Number(pa.user_id),
                full_name: `Usuario #${pa.user_id}`,
                email: '',
                role: 'INSTRUCTOR',
                document: '',
                is_principal: pa.is_principal ?? false
              };
            }
            return {
              id: u.id,
              full_name: u.full_name,
              email: u.email,
              role: u.role,
              document: u.document,
              is_principal: pa.is_principal ?? false
            };
          });

          const groups = pGroups.map((ptg: any) => {
            const g = groupMap.get(Number(ptg.training_group_id));
            if (!g) {
              return {
                id: Number(ptg.training_group_id),
                number: String(ptg.training_group_id),
                training_program: 'Programa formativo',
                schedule: 'DIURNA',
                status: 'Activo'
              };
            }
            return {
              id: g.id,
              number: g.number,
              training_program: g.training_program,
              schedule: g.schedule,
              status: g.status
            };
          });

          const attachments = pAttachments.map((att: any) => {
            const fileName = att.file_name || 'documento.pdf';
            const fileSize = Number(att.file_size || 0);
            const fileType = att.file_type || 'application/pdf';
            const storagePath = att.storage_path || null;
            let dataUrl = att.data_url || '';

            // Si tiene storage_path en el bucket, generar la URL pública desde Supabase Storage
            if (storagePath && client) {
              const { data: pubData } = client.storage.from('project_attachments').getPublicUrl(storagePath);
              if (pubData?.publicUrl) {
                dataUrl = pubData.publicUrl;
              }
            }

            return {
              id: String(att.id),
              name: fileName,
              file_name: fileName,
              size: formatBytes(fileSize),
              file_size: fileSize,
              size_bytes: fileSize,
              file_type: fileType,
              mime_type: fileType,
              storage_path: storagePath,
              data_url: dataUrl,
              file_url: dataUrl,
              uploaded_at: att.uploaded_at
            };
          });

          return {
            id: pid,
            name: p.name,
            training_center_id: Number(p.training_center_id || 1),
            training_center_name: p.training_center_name || 'Centro Latinoamericano de Especies Menores (CLEM)',
            regional_name: p.regional_name || 'Valle del Cauca',
            beneficiaries: p.beneficiaries || '',
            executive_summary: p.executive_summary || '',
            keywords: Array.isArray(p.keywords)
              ? p.keywords
              : (typeof p.keywords === 'string' ? (() => { try { return JSON.parse(p.keywords); } catch { return []; } })() : []),
            general_objective: p.general_objective || '',
            specific_objectives: Array.isArray(p.specific_objectives)
              ? p.specific_objectives
              : (typeof p.specific_objectives === 'string' ? (() => { try { return JSON.parse(p.specific_objectives); } catch { return []; } })() : []),
            start_date: p.start_date,
            end_date: p.end_date,
            total_budget: Number(p.total_budget || 0),
            status: p.status || 'EN EJECUCIÓN',
            progress: Number(p.progress || 0),
            created_by_user_id: Number(p.created_by_user_id || 1),
            author_ids: author_ids.length > 0 ? author_ids : (p.created_by_user_id ? [Number(p.created_by_user_id)] : [1]),
            authors,
            training_group_ids: training_group_ids.length > 0 ? training_group_ids : [1],
            training_groups: groups,
            attachments,
            created_at: p.created_at,
            updated_at: p.updated_at,
            is_deleted: !!p.is_deleted
          };
        });
      } else if (dbProjects && dbProjects.length === 0) {
        return [];
      }
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllProjects, usando memoria:', err.message);
    }
  }

  return memoryProjects;
}

async function createProjectInSupabase(data: any): Promise<any> {
  if (!supabaseClient) throw new Error('Supabase no conectado');

  // 1. Insert main project record
  const { data: inserted, error: insertErr } = await supabaseClient
    .from('projects')
    .insert({
      id: data.id || undefined,
      name: data.name,
      training_center_id: data.training_center_id || 1,
      training_center_name: data.training_center_name || 'Centro Latinoamericano de Especies Menores (CLEM)',
      regional_name: data.regional_name || 'Valle del Cauca',
      beneficiaries: data.beneficiaries || '',
      executive_summary: data.executive_summary || '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      general_objective: data.general_objective || '',
      specific_objectives: Array.isArray(data.specific_objectives) ? data.specific_objectives : [],
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || new Date().toISOString().split('T')[0],
      total_budget: Number(data.total_budget || 0),
      status: data.status || 'EN EJECUCIÓN',
      progress: Number(data.progress || 0),
      created_by_user_id: data.created_by_user_id || 1,
      is_deleted: false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertErr) throw insertErr;
  const projectId = Number(inserted.id);

  // 2. Extract and insert authors into project_authors
  let authorList: { user_id: number; is_principal: boolean }[] = [];
  if (Array.isArray(data.author_ids) && data.author_ids.length > 0) {
    authorList = data.author_ids.map((uid: any, idx: number) => ({
      user_id: Number(uid),
      is_principal: idx === 0
    }));
  } else if (Array.isArray(data.authors) && data.authors.length > 0) {
    authorList = data.authors.map((a: any, idx: number) => ({
      user_id: typeof a === 'object' && a !== null ? Number(a.id || a.user_id) : Number(a),
      is_principal: typeof a === 'object' && a !== null ? (a.is_principal ?? idx === 0) : (idx === 0)
    }));
  } else if (data.created_by_user_id) {
    authorList = [{ user_id: Number(data.created_by_user_id), is_principal: true }];
  }

  const seenUserIds = new Set<number>();
  const cleanAuthors = authorList.filter(a => {
    if (!a.user_id || isNaN(a.user_id) || a.user_id <= 0 || seenUserIds.has(a.user_id)) return false;
    seenUserIds.add(a.user_id);
    return true;
  });

  if (cleanAuthors.length > 0) {
    const authorsPayload = cleanAuthors.map(a => ({
      project_id: projectId,
      user_id: a.user_id,
      is_principal: a.is_principal
    }));
    const { error: authErr } = await supabaseClient.from('project_authors').insert(authorsPayload);
    if (authErr) {
      console.error('[Supabase] Error insertando project_authors:', authErr.message);
    }
  }

  // 3. Extract and insert training groups into project_training_groups
  let groupList: number[] = [];
  if (Array.isArray(data.training_group_ids) && data.training_group_ids.length > 0) {
    groupList = data.training_group_ids.map((gid: any) => Number(gid));
  } else if (Array.isArray(data.training_groups) && data.training_groups.length > 0) {
    groupList = data.training_groups.map((g: any) =>
      typeof g === 'object' && g !== null ? Number(g.id || g.training_group_id) : Number(g)
    );
  }

  const seenGroupIds = new Set<number>();
  const cleanGroups = groupList.filter(gid => {
    if (!gid || isNaN(gid) || gid <= 0 || seenGroupIds.has(gid)) return false;
    seenGroupIds.add(gid);
    return true;
  });

  if (cleanGroups.length > 0) {
    const groupsPayload = cleanGroups.map(gid => ({
      project_id: projectId,
      training_group_id: gid
    }));
    const { error: grpErr } = await supabaseClient.from('project_training_groups').insert(groupsPayload);
    if (grpErr) {
      console.error('[Supabase] Error insertando project_training_groups:', grpErr.message);
    }
  }

  // 4. Subir anexos al bucket 'project_attachments' y guardar la referencia en la tabla project_attachments
  let normalizedAttachments: any[] = [];
  if (Array.isArray(data.attachments) && data.attachments.length > 0) {
    const uploadResults = await Promise.all(
      data.attachments.map((att: any) => uploadAttachmentToBucket(projectId, att, supabaseClient!))
    );

    const attPayload = uploadResults.map((res: UploadedAttachmentResult, idx: number) => {
      const origAtt = data.attachments[idx];
      return {
        project_id: projectId,
        file_name: res.file_name,
        file_size: res.file_size,
        file_type: res.file_type,
        storage_path: res.storage_path,
        data_url: res.public_url || null,
        uploaded_at: origAtt.uploaded_at || new Date().toISOString()
      };
    });

    const { error: attErr } = await supabaseClient.from('project_attachments').insert(attPayload);
    if (attErr) {
      console.warn('[Supabase] Aviso al insertar en project_attachments, reintentando con fallback de columnas:', attErr.message);
      // Fallback en caso de que la columna storage_path no esté en el schema de Supabase todavía
      const fallbackPayload = attPayload.map(p => ({
        project_id: p.project_id,
        file_name: p.file_name,
        file_size: p.file_size,
        file_type: p.file_type,
        data_url: p.data_url || p.storage_path,
        uploaded_at: p.uploaded_at
      }));
      await supabaseClient.from('project_attachments').insert(fallbackPayload);
    }

    normalizedAttachments = uploadResults.map((res: UploadedAttachmentResult, idx: number) => {
      const origAtt = data.attachments[idx];
      return {
        id: origAtt.id || `att-${projectId}-${idx + 1}`,
        name: res.file_name,
        file_name: res.file_name,
        file_size: res.file_size,
        size_bytes: res.file_size,
        size: formatBytes(res.file_size),
        file_type: res.file_type,
        mime_type: res.file_type,
        storage_path: res.storage_path,
        data_url: res.public_url,
        file_url: res.public_url,
        uploaded_at: origAtt.uploaded_at || new Date().toISOString()
      };
    });
  }

  // Build hydrated response
  const allUsers = await getAllUsers();
  const allGroups = await getAllGroups();
  const userMap = new Map(allUsers.map((u: any) => [Number(u.id), u]));
  const groupMap = new Map(allGroups.map((g: any) => [Number(g.id), g]));

  const authorIds = cleanAuthors.map(a => a.user_id);
  const authors = cleanAuthors.map(a => {
    const u = userMap.get(a.user_id);
    return {
      id: a.user_id,
      full_name: u?.full_name || `Usuario #${a.user_id}`,
      email: u?.email || '',
      role: u?.role || 'INSTRUCTOR',
      document: u?.document || '',
      is_principal: a.is_principal
    };
  });

  const trainingGroupIds = cleanGroups;
  const trainingGroups = cleanGroups.map(gid => {
    const g = groupMap.get(gid);
    return {
      id: gid,
      number: g?.number || String(gid),
      training_program: g?.training_program || 'Programa Formativo',
      schedule: g?.schedule || 'DIURNA',
      status: g?.status || 'Activo'
    };
  });

  return {
    ...inserted,
    id: projectId,
    training_center_id: Number(inserted.training_center_id || data.training_center_id || 1),
    training_center_name: inserted.training_center_name || data.training_center_name || 'Centro Latinoamericano de Especies Menores (CLEM)',
    regional_name: inserted.regional_name || data.regional_name || 'Valle del Cauca',
    beneficiaries: inserted.beneficiaries || data.beneficiaries || '',
    executive_summary: inserted.executive_summary || data.executive_summary || '',
    keywords: Array.isArray(inserted.keywords) ? inserted.keywords : (data.keywords || []),
    general_objective: inserted.general_objective || data.general_objective || '',
    specific_objectives: Array.isArray(inserted.specific_objectives) ? inserted.specific_objectives : (data.specific_objectives || []),
    start_date: inserted.start_date || data.start_date,
    end_date: inserted.end_date || data.end_date,
    total_budget: Number(inserted.total_budget || data.total_budget || 0),
    status: inserted.status || data.status || 'EN EJECUCIÓN',
    progress: Number(inserted.progress || data.progress || 0),
    created_by_user_id: Number(inserted.created_by_user_id || data.created_by_user_id || 1),
    author_ids: authorIds.length > 0 ? authorIds : [1],
    authors,
    training_group_ids: trainingGroupIds.length > 0 ? trainingGroupIds : [1],
    training_groups: trainingGroups,
    attachments: normalizedAttachments,
    created_at: inserted.created_at || data.created_at || new Date().toISOString(),
    updated_at: inserted.updated_at || new Date().toISOString(),
    is_deleted: false
  };
}

export async function createProject(data: any): Promise<any> {
  const client = getClient();
  if (client) {
    try {
      const created = await createProjectInSupabase(data);
      // Sync memory
      memoryProjects.unshift(created);
      return created;
    } catch (err: any) {
      console.warn('[Supabase] Error creando proyecto en Supabase, guardando en memoria:', err.message);
    }
  }

  const nextId = memoryProjects.length > 0 ? Math.max(...memoryProjects.map((p: any) => p.id)) + 1 : 1;
  const authorIds = Array.isArray(data.author_ids) && data.author_ids.length > 0
    ? data.author_ids
    : (data.created_by_user_id ? [data.created_by_user_id] : [1]);
  const groupIds = Array.isArray(data.training_group_ids) && data.training_group_ids.length > 0
    ? data.training_group_ids
    : [1];

  const normalizedAttachments = (data.attachments || []).map((att: any, idx: number) => {
    const fileName = att.file_name || att.name || 'documento_adjunto.pdf';
    const fileSize = Number(att.file_size || att.size_bytes || 0) || 1024;
    const fileType = att.file_type || att.mime_type || 'application/pdf';
    const dataUrl = att.data_url || att.file_url || '';

    return {
      id: att.id || `att-${nextId}-${idx + 1}`,
      name: fileName,
      file_name: fileName,
      file_size: fileSize,
      size_bytes: fileSize,
      size: formatBytes(fileSize),
      file_type: fileType,
      mime_type: fileType,
      data_url: dataUrl,
      file_url: dataUrl,
      uploaded_at: att.uploaded_at || new Date().toISOString()
    };
  });

  const newProject = {
    ...data,
    id: nextId,
    author_ids: authorIds,
    training_group_ids: groupIds,
    attachments: normalizedAttachments,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memoryProjects.unshift(newProject);
  return newProject;
}

export async function updateProject(id: number, data: any): Promise<any> {
  const client = getClient();
  if (client) {
    try {
      const { error: updateErr } = await client
        .from('projects')
        .update({
          name: data.name,
          training_center_id: data.training_center_id || 1,
          training_center_name: data.training_center_name || 'Centro Latinoamericano de Especies Menores (CLEM)',
          regional_name: data.regional_name || 'Regional Valle',
          beneficiaries: data.beneficiaries || '',
          executive_summary: data.executive_summary || '',
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          general_objective: data.general_objective || '',
          specific_objectives: Array.isArray(data.specific_objectives) ? data.specific_objectives : [],
          start_date: data.start_date,
          end_date: data.end_date,
          total_budget: Number(data.total_budget || 0),
          status: data.status || 'EN EJECUCIÓN',
          progress: Number(data.progress || 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateErr) throw updateErr;

      // 1. Update authors in project_authors
      await client.from('project_authors').delete().eq('project_id', id);
      let authorList: { user_id: number; is_principal: boolean }[] = [];
      if (Array.isArray(data.author_ids) && data.author_ids.length > 0) {
        authorList = data.author_ids.map((uid: any, idx: number) => ({
          user_id: Number(uid),
          is_principal: idx === 0
        }));
      } else if (Array.isArray(data.authors) && data.authors.length > 0) {
        authorList = data.authors.map((a: any, idx: number) => ({
          user_id: typeof a === 'object' && a !== null ? Number(a.id || a.user_id) : Number(a),
          is_principal: typeof a === 'object' && a !== null ? (a.is_principal ?? idx === 0) : (idx === 0)
        }));
      }

      const seenUserIds = new Set<number>();
      const cleanAuthors = authorList.filter(a => {
        if (!a.user_id || isNaN(a.user_id) || a.user_id <= 0 || seenUserIds.has(a.user_id)) return false;
        seenUserIds.add(a.user_id);
        return true;
      });

      if (cleanAuthors.length > 0) {
        const authorsPayload = cleanAuthors.map(a => ({
          project_id: id,
          user_id: a.user_id,
          is_principal: a.is_principal
        }));
        await client.from('project_authors').insert(authorsPayload);
      }

      // 2. Update groups in project_training_groups
      await client.from('project_training_groups').delete().eq('project_id', id);
      let groupList: number[] = [];
      if (Array.isArray(data.training_group_ids) && data.training_group_ids.length > 0) {
        groupList = data.training_group_ids.map((gid: any) => Number(gid));
      } else if (Array.isArray(data.training_groups) && data.training_groups.length > 0) {
        groupList = data.training_groups.map((g: any) =>
          typeof g === 'object' && g !== null ? Number(g.id || g.training_group_id) : Number(g)
        );
      }

      const seenGroupIds = new Set<number>();
      const cleanGroups = groupList.filter(gid => {
        if (!gid || isNaN(gid) || gid <= 0 || seenGroupIds.has(gid)) return false;
        seenGroupIds.add(gid);
        return true;
      });

      if (cleanGroups.length > 0) {
        const groupsPayload = cleanGroups.map(gid => ({
          project_id: id,
          training_group_id: gid
        }));
        await client.from('project_training_groups').insert(groupsPayload);
      }

      // 3. Update attachments in bucket 'project_attachments' and save reference in project_attachments table
      await client.from('project_attachments').delete().eq('project_id', id);
      let normalizedAttachments: any[] = [];
      if (Array.isArray(data.attachments) && data.attachments.length > 0) {
        const uploadResults = await Promise.all(
          data.attachments.map((att: any) => uploadAttachmentToBucket(id, att, client))
        );

        const attPayload = uploadResults.map((res: UploadedAttachmentResult, idx: number) => {
          const origAtt = data.attachments[idx];
          return {
            project_id: id,
            file_name: res.file_name,
            file_size: res.file_size,
            file_type: res.file_type,
            storage_path: res.storage_path,
            data_url: res.public_url || null,
            uploaded_at: origAtt.uploaded_at || new Date().toISOString()
          };
        });

        const { error: attErr } = await client.from('project_attachments').insert(attPayload);
        if (attErr) {
          console.warn('[Supabase] Aviso al actualizar project_attachments con storage_path, reintentando fallback:', attErr.message);
          const fallbackPayload = attPayload.map(p => ({
            project_id: p.project_id,
            file_name: p.file_name,
            file_size: p.file_size,
            file_type: p.file_type,
            data_url: p.data_url || p.storage_path,
            uploaded_at: p.uploaded_at
          }));
          await client.from('project_attachments').insert(fallbackPayload);
        }

        normalizedAttachments = uploadResults.map((res: UploadedAttachmentResult, idx: number) => {
          const origAtt = data.attachments[idx];
          return {
            id: origAtt.id || `att-${id}-${idx + 1}`,
            name: res.file_name,
            file_name: res.file_name,
            file_size: res.file_size,
            size_bytes: res.file_size,
            size: formatBytes(res.file_size),
            file_type: res.file_type,
            mime_type: res.file_type,
            storage_path: res.storage_path,
            data_url: res.public_url,
            file_url: res.public_url,
            uploaded_at: origAtt.uploaded_at || new Date().toISOString()
          };
        });
      }

      const updated = {
        ...data,
        id,
        author_ids: cleanAuthors.map(a => a.user_id),
        training_group_ids: cleanGroups,
        attachments: normalizedAttachments,
        updated_at: new Date().toISOString()
      };
      const idx = memoryProjects.findIndex((p: any) => p.id === id);
      if (idx !== -1) memoryProjects[idx] = updated;
      return updated;
    } catch (err: any) {
      console.warn('[Supabase] Error actualizando proyecto en Supabase:', err.message);
    }
  }

  const idx = memoryProjects.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    memoryProjects[idx] = { ...memoryProjects[idx], ...data, updated_at: new Date().toISOString() };
    return memoryProjects[idx];
  }
  return data;
}

export async function deleteProject(id: number): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      const { error } = await client.from('projects').update({ is_deleted: true }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.warn('[Supabase] Error eliminando proyecto:', err.message);
    }
  }

  memoryProjects = memoryProjects.filter((p: any) => p.id !== id);
  return true;
}

export async function updateProjectStatus(id: number, status: string): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      const { error } = await client.from('projects').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.warn('[Supabase] Error actualizando estado:', err.message);
    }
  }

  const found = memoryProjects.find((p: any) => p.id === id);
  if (found) found.status = status;
  return true;
}

// --------------------------------------------------------------------------
// USUARIOS
// --------------------------------------------------------------------------

export async function getAllUsers(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('users').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) {
        return data.map((u: any) => ({
          id: Number(u.id),
          document_type: u.document_type,
          document: u.document,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          created_at: u.created_at
        }));
      }
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllUsers:', err.message);
    }
  }
  return memoryUsers;
}

export async function getUserWithPasswordByEmail(email: string): Promise<any | null> {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return null;

  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: Number(data.id),
          document_type: data.document_type,
          document: data.document,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          password: data.password || '',
          created_at: data.created_at
        };
      }
    } catch (err: any) {
      console.warn('[Supabase] Error en getUserWithPasswordByEmail:', err.message);
    }
  }

  const found = memoryUsers.find((u: any) => (u.email || '').toLowerCase() === cleanEmail);
  if (found) {
    return {
      ...found,
      password: found.password || bcrypt.hashSync('password', 10)
    };
  }
  return null;
}

export async function createUser(data: any): Promise<any> {
  const client = getClient();
  const rawPassword = data.password || 'password';
  const hashedPassword = rawPassword.startsWith('$2a$') || rawPassword.startsWith('$2b$') || rawPassword.startsWith('$2y$')
    ? rawPassword
    : bcrypt.hashSync(rawPassword, 10);

  if (client) {
    try {
      const { data: inserted, error } = await client
        .from('users')
        .insert({
          document_type: data.document_type || 'Cédula de Ciudadanía',
          document: data.document,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          role: data.role || 'INSTRUCTOR',
          status: data.status || 'Activo',
          password: hashedPassword
        })
        .select()
        .single();

      if (!error && inserted) {
        const { password: _, ...created } = { ...data, id: Number(inserted.id) };
        memoryUsers.push(created);
        return created;
      }
    } catch (err: any) {
      console.warn('[Supabase] Error creando usuario:', err.message);
    }
  }

  const nextId = memoryUsers.length > 0 ? Math.max(...memoryUsers.map((u: any) => u.id)) + 1 : 1;
  const { password: _, ...created } = { ...data, id: nextId, password: hashedPassword, created_at: new Date().toISOString() };
  memoryUsers.push(created);
  return created;
}

export async function updateUser(id: number, data: any): Promise<any> {
  const client = getClient();
  const updatePayload: any = {
    document_type: data.document_type,
    document: data.document,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    role: data.role,
    status: data.status
  };

  if (data.password && data.password.trim()) {
    const raw = data.password.trim();
    updatePayload.password = raw.startsWith('$2a$') || raw.startsWith('$2b$') || raw.startsWith('$2y$')
      ? raw
      : bcrypt.hashSync(raw, 10);
  }

  if (client) {
    try {
      const { error } = await client
        .from('users')
        .update(updatePayload)
        .eq('id', id);

      if (!error) {
        const idx = memoryUsers.findIndex((u: any) => u.id === id);
        if (idx !== -1) memoryUsers[idx] = { ...memoryUsers[idx], ...data };
        return { ...data, id };
      }
    } catch (err: any) {
      console.warn('[Supabase] Error actualizando usuario:', err.message);
    }
  }

  const idx = memoryUsers.findIndex((u: any) => u.id === id);
  if (idx !== -1) {
    memoryUsers[idx] = { ...memoryUsers[idx], ...data };
    return memoryUsers[idx];
  }
  return data;
}

export async function toggleUserStatus(id: number): Promise<string> {
  const users = await getAllUsers();
  const user = users.find((u: any) => u.id === id);
  const newStatus = user && user.status === 'Activo' ? 'Inactivo' : 'Activo';

  const client = getClient();
  if (client) {
    try {
      await client.from('users').update({ status: newStatus }).eq('id', id);
    } catch (err: any) {
      console.warn('[Supabase] Error toggling status:', err.message);
    }
  }

  const found = memoryUsers.find((u: any) => u.id === id);
  if (found) found.status = newStatus;
  return newStatus;
}

export async function deleteUser(id: number): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('users').delete().eq('id', id);
    } catch (err: any) {
      console.warn('[Supabase] Error eliminando usuario:', err.message);
    }
  }
  memoryUsers = memoryUsers.filter((u: any) => u.id !== id);
  return true;
}

// --------------------------------------------------------------------------
// FICHAS / GRUPOS
// --------------------------------------------------------------------------

export async function getAllGroups(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('training_groups').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) {
        return data.map((g: any) => ({
          id: Number(g.id),
          number: g.number,
          training_program: g.training_program,
          schedule: g.schedule,
          status: g.status,
          training_center_id: g.training_center_id
        }));
      }
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllGroups:', err.message);
    }
  }
  return memoryGroups;
}

export async function createGroup(data: any): Promise<any> {
  const client = getClient();
  if (client) {
    try {
      const { data: inserted, error } = await client
        .from('training_groups')
        .insert({
          number: data.number,
          training_program: data.training_program,
          schedule: data.schedule || 'DIURNA',
          status: data.status || 'Activo',
          training_center_id: data.training_center_id || 1
        })
        .select()
        .single();

      if (!error && inserted) {
        const created = { ...data, id: Number(inserted.id) };
        memoryGroups.push(created);
        return created;
      }
    } catch (err: any) {
      console.warn('[Supabase] Error creando ficha:', err.message);
    }
  }

  const nextId = memoryGroups.length > 0 ? Math.max(...memoryGroups.map((g: any) => g.id)) + 1 : 1;
  const created = { ...data, id: nextId };
  memoryGroups.push(created);
  return created;
}

export async function updateGroup(id: number, data: any): Promise<any> {
  const client = getClient();
  if (client) {
    try {
      await client
        .from('training_groups')
        .update({
          number: data.number,
          training_program: data.training_program,
          schedule: data.schedule,
          status: data.status
        })
        .eq('id', id);

      const idx = memoryGroups.findIndex((g: any) => g.id === id);
      if (idx !== -1) memoryGroups[idx] = { ...memoryGroups[idx], ...data };
      return { ...data, id };
    } catch (err: any) {
      console.warn('[Supabase] Error actualizando ficha:', err.message);
    }
  }

  const idx = memoryGroups.findIndex((g: any) => g.id === id);
  if (idx !== -1) {
    memoryGroups[idx] = { ...memoryGroups[idx], ...data };
    return memoryGroups[idx];
  }
  return data;
}

export async function toggleGroupStatus(id: number): Promise<string> {
  const groups = await getAllGroups();
  const group = groups.find((g: any) => g.id === id);
  const newStatus = group && group.status === 'Activo' ? 'Inactivo' : 'Activo';

  const client = getClient();
  if (client) {
    try {
      await client.from('training_groups').update({ status: newStatus }).eq('id', id);
    } catch (err: any) {
      console.warn('[Supabase] Error toggling group status:', err.message);
    }
  }

  const found = memoryGroups.find((g: any) => g.id === id);
  if (found) found.status = newStatus;
  return newStatus;
}

export async function deleteGroup(id: number): Promise<boolean> {
  const client = getClient();
  if (client) {
    try {
      await client.from('training_groups').delete().eq('id', id);
    } catch (err: any) {
      console.warn('[Supabase] Error eliminando ficha:', err.message);
    }
  }
  memoryGroups = memoryGroups.filter((g: any) => g.id !== id);
  return true;
}

// --------------------------------------------------------------------------
// DATOS MAESTROS
// --------------------------------------------------------------------------

export async function getAllCenters(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('training_centers').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) return data;
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllCenters:', err.message);
    }
  }
  return memoryCenters;
}

export async function getAllDepartments(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('departments').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) return data;
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllDepartments:', err.message);
    }
  }
  return memoryDepartments;
}

export async function getAllCities(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('cities').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) return data;
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllCities:', err.message);
    }
  }
  return memoryCities;
}

// --------------------------------------------------------------------------
// LOGS DE AUDITORÍA
// --------------------------------------------------------------------------

export async function getAllActivityLogs(): Promise<any[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client.from('activity_logs').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((l: any) => ({
          id: Number(l.id),
          user_id: Number(l.user_id),
          user_name: l.user_name,
          user_avatar: l.user_avatar,
          action_label: l.action_label,
          action_type: l.action_type,
          detail: l.detail,
          module: l.module,
          payload: l.payload,
          timestamp: l.timestamp
        }));
      }
    } catch (err: any) {
      console.warn('[Supabase] Error en getAllActivityLogs:', err.message);
    }
  }
  return memoryLogs;
}

export async function createActivityLog(data: any): Promise<any> {
  const client = getClient();
  if (client) {
    try {
      const { data: inserted, error } = await client
        .from('activity_logs')
        .insert({
          user_id: data.user_id,
          user_name: data.user_name,
          user_avatar: data.user_avatar || null,
          action_label: data.action_label,
          action_type: data.action_type,
          detail: data.detail,
          module: data.module,
          payload: data.payload || null,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && inserted) {
        const created = { ...data, id: Number(inserted.id), timestamp: inserted.timestamp };
        memoryLogs.unshift(created);
        return created;
      }
    } catch (err: any) {
      console.warn('[Supabase] Error guardando log:', err.message);
    }
  }

  const nextId = memoryLogs.length > 0 ? Math.max(...memoryLogs.map((l: any) => l.id)) + 1 : 1;
  const newLog = { ...data, id: nextId, timestamp: new Date().toISOString() };
  memoryLogs.unshift(newLog);
  return newLog;
}
