import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://jkorczrtrsasbsgnzqnd.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3JjenJ0cnNhc2JzZ256cW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgzOTMzMiwiZXhwIjoyMTAzNDE1MzMyfQ.yaQJX4SQAl76T5J11y68LxleSC69LIL3Ctig_yOmQeQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

  try {
    let body: any = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cuerpo de solicitud inválido (JSON esperado).' })
      };
    }

    const { email } = body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Debe ingresar su correo electrónico institucional.' })
      };
    }

    // 1. Buscar usuario en Supabase
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, full_name, email, role, status')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (userErr) {
      console.error('[Netlify send-recovery-code] Error consultando usuario:', userErr);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error al consultar la base de datos: ' + userErr.message })
      };
    }

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'No existe ninguna cuenta registrada con este correo electrónico institucional.'
        })
      };
    }

    if (user.status === 'Inactivo') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Esta cuenta se encuentra inactiva. Comuníquese con el administrador del CLEM.'
        })
      };
    }

    // 2. Generar código OTP de 6 dígitos numéricos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    // 3. Almacenar código en Supabase activity_logs para persistencia multi-instancia
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      user_name: user.full_name,
      action_label: 'Código de Recuperación OTP',
      action_type: 'ESTADO',
      detail: `Generación de código OTP para ${cleanEmail}`,
      module: 'Autenticación',
      payload: { code, expiresAt }
    });

    // 4. Configurar transporte SMTP con las variables de Netlify
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const userSmtp = process.env.SMTP_USER || '';
    const passSmtp = process.env.SMTP_PASS || '';
    const fromAddress = process.env.SMTP_FROM || `DynaPro - SENA CLEM <${userSmtp || 'notificaciones@sena.edu.co'}>`;

    if (!userSmtp || !passSmtp) {
      console.error('[Netlify send-recovery-code] Credenciales SMTP_USER o SMTP_PASS no configuradas');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Servidor de correo no configurado. Asegúrese de haber configurado SMTP_USER y SMTP_PASS en las variables de entorno de Netlify.'
        })
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: userSmtp,
        pass: passSmtp
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Restablecimiento de Contraseña - DynaPro SENA</title>
</head>
<body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5fceb; margin: 0; padding: 30px 10px; color: #171d13;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #dee5d4;">
    
    <div style="background: linear-gradient(135deg, #226d00, #39a900); padding: 35px 30px; text-align: center; color: #ffffff;">
      <div style="width: 55px; height: 55px; background: #ffffff; border-radius: 50%; margin: 0 auto 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="font-size: 30px; color: #39a900; line-height: 55px;">&#9881;</span>
      </div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">DynaPro</h1>
      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">Centro Latinoamericano de Especies Menores (SENA CLEM)</p>
    </div>

    <div style="padding: 35px 30px;">
      <h2 style="font-size: 19px; color: #171d13; margin-top: 0; font-weight: 700;">Restablecimiento de Contraseña</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Hola <strong>${user.full_name}</strong>,
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en la plataforma <strong>DynaPro</strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Utiliza el siguiente código de verificación de 6 dígitos para autorizar el cambio:
      </p>

      <div style="background: #eff6e5; border: 2px dashed #39a900; border-radius: 16px; padding: 22px; text-align: center; margin: 25px 0;">
        <span style="display: block; font-size: 11px; font-weight: 700; color: #226d00; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Código de Seguridad</span>
        <span style="font-family: 'Consolas', 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #171d13;">${code}</span>
        <span style="display: block; font-size: 11px; color: #6f7b66; margin-top: 8px;">Válido durante los próximos <strong>15 minutos</strong></span>
      </div>

      <div style="background: #f7f9fb; border-left: 4px solid #3c627f; padding: 14px 16px; border-radius: 0 10px 10px 0; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 12px; color: #3c627f; line-height: 1.5;">
          <strong>Información de seguridad:</strong> Si tú no solicitaste este cambio, puedes ignorar este mensaje con tranquilidad. Tu contraseña actual no se modificará mientras no se ingrese este código.
        </p>
      </div>

      <p style="font-size: 12px; color: #6f7b66; line-height: 1.5; margin-bottom: 0;">
        Este es un mensaje automático generado por el sistema de autenticación de DynaPro. Por favor no respondas a este correo.
      </p>
    </div>

    <div style="background: #f5fceb; border-top: 1px solid #dee5d4; padding: 18px 30px; text-align: center; font-size: 11px; color: #6f7b66;">
      &copy; ${new Date().getFullYear()} SENA - Centro Latinoamericano de Especies Menores (CLEM - Tuluá). Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: `Código de verificación: ${code} - DynaPro SENA`,
      text: `Hola ${user.full_name},\n\nTu código de verificación para restablecer tu contraseña en DynaPro es: ${code}\n\nEste código es válido por 15 minutos.\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
      html: htmlContent
    });

    console.log(`[Netlify send-recovery-code] Correo enviado exitosamente a ${cleanEmail}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Se ha enviado un código de verificación de 6 dígitos al correo ${cleanEmail}.`
      })
    };
  } catch (err: any) {
    console.error('[Netlify send-recovery-code] Error inesperado:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Error al enviar correo vía SMTP: ${err.message || err}`
      })
    };
  }
};
