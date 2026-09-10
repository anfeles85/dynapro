import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getDbStatus,
  checkTitleDuplicate,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getAllUsers,
  getUserWithPasswordByEmail,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllGroups,
  createGroup,
  updateGroup,
  toggleGroupStatus,
  deleteGroup,
  getAllCenters,
  getAllDepartments,
  getAllCities,
  getAllActivityLogs,
  createActivityLog
} from './server/db';
import { sendRecoveryCodeEmail } from './server/mail';

interface RecoveryCodeEntry {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}
const recoveryCodes = new Map<string, RecoveryCodeEntry>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing and cors
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Supabase database connection
  await initDatabase();

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check & DB Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/db-status', async (req, res) => {
    try {
      const status = await getDbStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  // Re-attempt DB connection if credentials were set
  app.post('/api/db-reconnect', async (req, res) => {
    try {
      const success = await initDatabase();
      const status = await getDbStatus();
      res.json({ success, status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- PROJECTS API ---
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await getAllProjects();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al consultar proyectos en Supabase: ' + err.message });
    }
  });

  app.post('/api/projects/check-title', async (req, res) => {
    try {
      const { title, excludeId } = req.body;
      const isDuplicate = await checkTitleDuplicate(title, excludeId ? Number(excludeId) : undefined);
      res.json({ isDuplicate });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = req.body;
      const created = await createProject(projectData);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al guardar el proyecto en Supabase: ' + err.message });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const projectData = req.body;
      const updated = await updateProject(id, projectData);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al actualizar proyecto en Supabase: ' + err.message });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteProject(id);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al eliminar proyecto en Supabase: ' + err.message });
    }
  });

  app.patch('/api/projects/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      await updateProjectStatus(id, status);
      res.json({ success: true, id, status });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al actualizar estado en Supabase: ' + err.message });
    }
  });

  // --- USERS API ---
  app.get('/api/users', async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al consultar usuarios en Supabase: ' + err.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      const created = await createUser(userData);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al crear usuario en Supabase: ' + err.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userData = req.body;
      const updated = await updateUser(id, userData);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al actualizar usuario en Supabase: ' + err.message });
    }
  });

  app.patch('/api/users/:id/toggle-status', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const newStatus = await toggleUserStatus(id);
      res.json({ success: true, id, status: newStatus });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al cambiar estado de usuario: ' + err.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteUser(id);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al eliminar usuario en Supabase: ' + err.message });
    }
  });

  // --- TRAINING GROUPS API ---
  app.get('/api/groups', async (req, res) => {
    try {
      const groups = await getAllGroups();
      res.json(groups);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al consultar grupos en Supabase: ' + err.message });
    }
  });

  app.post('/api/groups', async (req, res) => {
    try {
      const groupData = req.body;
      const created = await createGroup(groupData);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al registrar ficha en Supabase: ' + err.message });
    }
  });

  app.put('/api/groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const groupData = req.body;
      const updated = await updateGroup(id, groupData);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al actualizar ficha en Supabase: ' + err.message });
    }
  });

  app.patch('/api/groups/:id/toggle-status', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const newStatus = await toggleGroupStatus(id);
      res.json({ success: true, id, status: newStatus });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al cambiar estado de ficha: ' + err.message });
    }
  });

  app.delete('/api/groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteGroup(id);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al eliminar ficha en Supabase: ' + err.message });
    }
  });

  // --- MASTER DATA API ---
  app.get('/api/centers', async (req, res) => {
    try {
      const centers = await getAllCenters();
      res.json(centers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/departments', async (req, res) => {
    try {
      const departments = await getAllDepartments();
      res.json(departments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await getAllCities();
      res.json(cities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ACTIVITY LOGS & AUDIT API ---
  app.get('/api/activity-logs', async (req, res) => {
    try {
      const logs = await getAllActivityLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al consultar logs de auditoría: ' + err.message });
    }
  });

  app.post('/api/activity-logs', async (req, res) => {
    try {
      const logData = req.body;
      const created = await createActivityLog(logData);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al registrar log de auditoría: ' + err.message });
    }
  });

  // --- AUTHENTICATION API ---
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Debe ingresar el correo electrónico y la contraseña.' });
      }

      const user = await getUserWithPasswordByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo y contraseña.' });
      }

      if (user.status === 'Inactivo') {
        return res.status(403).json({ error: 'Esta cuenta se encuentra inactiva. Comuníquese con el administrador del CLEM.' });
      }

      // Validar contraseña con bcrypt
      const storedHash = user.password || '';
      let isMatch = false;

      if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
        isMatch = await bcrypt.compare(password, storedHash);
      } else if (storedHash) {
        // Fallback en caso de contraseña en texto plano en desarrollo
        isMatch = (password === storedHash);
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo institucional y contraseña.' });
      }

      // Sanitizar el objeto usuario para no retornar el hash de la contraseña al cliente
      const { password: _, ...sanitizedUser } = user;

      // Registrar evento de login en auditoría
      await createActivityLog({
        user_id: sanitizedUser.id,
        user_name: sanitizedUser.full_name,
        user_avatar: undefined,
        action_label: 'Inicio de Sesión',
        action_type: 'LOGIN',
        detail: `El usuario ${sanitizedUser.full_name} (${sanitizedUser.role}) inició sesión en DynaPro (autenticación bcrypt).`,
        module: 'Autenticación'
      });

      res.json({ success: true, user: sanitizedUser });
    } catch (err: any) {
      res.status(500).json({ error: 'Error en proceso de autenticación: ' + err.message });
    }
  });

  // --- PASSWORD RECOVERY / FORGOT PASSWORD WITH OTP ---
  app.post('/api/auth/send-recovery-code', async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({ error: 'Debe ingresar su correo institucional.' });
      }

      // Buscar usuario en el sistema
      let user = await getUserWithPasswordByEmail(cleanEmail);
      if (!user) {
        const allUsers = await getAllUsers();
        user = allUsers.find((u: any) => (u.email || '').toLowerCase() === cleanEmail);
      }

      if (!user) {
        return res.status(404).json({
          error: 'No existe ninguna cuenta registrada con este correo electrónico institucional.'
        });
      }

      if (user.status === 'Inactivo') {
        return res.status(403).json({
          error: 'Esta cuenta se encuentra inactiva. Comuníquese con el administrador del CLEM.'
        });
      }

      // Generar código OTP de 6 dígitos numéricos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

      recoveryCodes.set(cleanEmail, {
        email: cleanEmail,
        code,
        expiresAt,
        attempts: 0
      });

      // Guardar también en Supabase activity_logs para sincronización
      try {
        await createActivityLog({
          user_id: user.id,
          user_name: user.full_name,
          action_label: 'Código de Recuperación OTP',
          action_type: 'ESTADO',
          detail: `Generación de código OTP para ${cleanEmail}`,
          module: 'Autenticación',
          payload: { code, expiresAt }
        });
      } catch (logErr) {
        console.warn('Aviso guardando OTP en activity_logs:', logErr);
      }

      // Enviar correo vía Nodemailer / SMTP
      const mailResult = await sendRecoveryCodeEmail(cleanEmail, user.full_name, code);

      if (!mailResult.success) {
        return res.status(500).json({
          error: mailResult.error || 'No se pudo enviar el correo electrónico. Verifique la configuración SMTP en el servidor.'
        });
      }

      res.json({
        success: true,
        message: `Se ha enviado un código de verificación de 6 dígitos a ${cleanEmail}.`
      });
    } catch (err: any) {
      console.error('[Recovery Code] Error:', err);
      res.status(500).json({ error: 'Error al procesar el envío del código: ' + err.message });
    }
  });

  app.post('/api/auth/verify-recovery-code', async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanCode = (code || '').trim();

      if (!cleanEmail || !cleanCode || !newPassword) {
        return res.status(400).json({
          error: 'Debe ingresar el correo, el código de 6 dígitos y la nueva contraseña.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'La nueva contraseña debe tener al menos 6 caracteres.'
        });
      }

      const entry = recoveryCodes.get(cleanEmail);

      if (!entry || Date.now() > entry.expiresAt) {
        recoveryCodes.delete(cleanEmail);
        return res.status(400).json({
          error: 'El código de verificación ha expirado o no es válido. Por favor solicita uno nuevo.'
        });
      }

      entry.attempts += 1;
      if (entry.attempts > 5) {
        recoveryCodes.delete(cleanEmail);
        return res.status(400).json({
          error: 'Demasiados intentos fallidos. Por seguridad, solicita un nuevo código.'
        });
      }

      if (entry.code !== cleanCode) {
        return res.status(400).json({
          error: 'El código de verificación ingresado es incorrecto.'
        });
      }

      // Código verificado exitosamente
      recoveryCodes.delete(cleanEmail);

      // Buscar usuario y actualizar contraseña
      let user = await getUserWithPasswordByEmail(cleanEmail);
      if (!user) {
        const allUsers = await getAllUsers();
        user = allUsers.find((u: any) => (u.email || '').toLowerCase() === cleanEmail);
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado en la base de datos.' });
      }

      await updateUser(user.id, {
        ...user,
        password: newPassword
      });

      // Registrar auditoría
      await createActivityLog({
        user_id: user.id,
        user_name: user.full_name,
        user_avatar: undefined,
        action_label: 'Restablecimiento de Contraseña',
        action_type: 'EDITAR',
        detail: `El usuario ${user.full_name} (${user.role}) restableció su contraseña mediante código de seguridad OTP enviado por correo.`,
        module: 'Autenticación'
      });

      res.json({
        success: true,
        message: '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña.'
      });
    } catch (err: any) {
      console.error('[Verify Recovery Code] Error:', err);
      res.status(500).json({ error: 'Error al verificar el código: ' + err.message });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const users = await getAllUsers();
      const found = users.find((u: any) => (u.email || '').toLowerCase() === cleanEmail);

      if (!found) {
        return res.status(404).json({ error: 'El correo electrónico no se encuentra registrado en el sistema.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      recoveryCodes.set(cleanEmail, {
        email: cleanEmail,
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0
      });

      const mailResult = await sendRecoveryCodeEmail(cleanEmail, found.full_name, code);

      if (!mailResult.success) {
        return res.status(500).json({
          error: mailResult.error || 'No se pudo enviar el correo electrónico.'
        });
      }

      res.json({
        success: true,
        message: `Se ha enviado el código de verificación al correo ${cleanEmail}. Revise su bandeja de entrada.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const { userId, email, currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Debe ingresar la contraseña actual y la nueva contraseña.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la contraseña actual.' });
      }

      // Buscar usuario
      let user: any = null;
      if (email) {
        user = await getUserWithPasswordByEmail(email);
      } else if (userId) {
        const allUsers = await getAllUsers();
        const found = allUsers.find((u: any) => u.id === Number(userId));
        if (found) {
          user = await getUserWithPasswordByEmail(found.email);
        }
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no registrado en el sistema.' });
      }

      // Verificar contraseña actual
      const storedHash = user.password || '';
      let isMatch = false;

      if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
        isMatch = await bcrypt.compare(currentPassword, storedHash);
      } else if (storedHash) {
        isMatch = (currentPassword === storedHash);
      } else {
        isMatch = (currentPassword === 'password');
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta.' });
      }

      // Actualizar en base de datos
      await updateUser(user.id, {
        ...user,
        password: newPassword
      });

      // Auditoría
      await createActivityLog({
        user_id: user.id,
        user_name: user.full_name,
        user_avatar: undefined,
        action_label: 'Cambio de Contraseña',
        action_type: 'UPDATE',
        detail: `El usuario ${user.full_name} (${user.role}) actualizó exitosamente su contraseña de acceso.`,
        module: 'Seguridad'
      });

      res.json({ success: true, message: 'Contraseña actualizada exitosamente.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Error al cambiar la contraseña: ' + err.message });
    }
  });


  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) & STATIC FILES (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DynaPro Server] Servidor ejecutándose en el puerto ${PORT} con backend Supabase / PostgreSQL.`);
  });
}

startServer();
