import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder-key'
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido. Utilice POST.' })
    };
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Configuración del servidor incompleta (credenciales de Supabase no definidas).' })
    };
  }

  try {
    let body: any = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cuerpo de solicitud inválido.' })
      };
    }

    const { email, code, newPassword } = body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Debe ingresar el correo, el código de 6 dígitos y la nueva contraseña.'
        })
      };
    }

    if (newPassword.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'La nueva contraseña debe tener al menos 6 caracteres.'
        })
      };
    }

    // 1. Buscar usuario
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (userErr || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Usuario no encontrado en el sistema.' })
      };
    }

    // 2. Buscar el código OTP más reciente generado para este usuario en activity_logs
    const { data: logs, error: logErr } = await supabase
      .from('activity_logs')
      .select('id, payload')
      .eq('user_id', user.id)
      .eq('action_label', 'Código de Recuperación OTP')
      .order('id', { ascending: false })
      .limit(1);

    if (logErr || !logs || logs.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'No se encontró ninguna solicitud de recuperación pendiente o el código ya expiró.'
        })
      };
    }

    const latestLog = logs[0];
    const payload = latestLog.payload || {};

    if (payload.used) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Este código de verificación ya fue utilizado. Por favor solicita uno nuevo.'
        })
      };
    }

    if (Date.now() > payload.expiresAt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'El código de verificación ha expirado. Por favor solicita uno nuevo.'
        })
      };
    }

    if (payload.code !== cleanCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'El código de verificación ingresado es incorrecto.'
        })
      };
    }

    // 3. Marcar código como utilizado
    await supabase
      .from('activity_logs')
      .update({ payload: { ...payload, used: true, usedAt: new Date().toISOString() } })
      .eq('id', latestLog.id);

    // 4. Hashear con bcrypt y actualizar la contraseña del usuario en Supabase
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Error al actualizar la contraseña en la base de datos: ' + updateErr.message
        })
      };
    }

    // 5. Registrar log de auditoría
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      user_name: user.full_name,
      action_label: 'Restablecimiento de Contraseña',
      action_type: 'EDITAR',
      detail: `El usuario ${user.full_name} (${user.role}) restableció exitosamente su contraseña mediante código OTP.`,
      module: 'Autenticación'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña.'
      })
    };
  } catch (err: any) {
    console.error('[Netlify verify-recovery-code] Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno al verificar el código: ' + (err.message || err)
      })
    };
  }
};
