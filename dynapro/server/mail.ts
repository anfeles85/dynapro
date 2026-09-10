import nodemailer from 'nodemailer';

export interface MailSendResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(
    host &&
    user &&
    pass &&
    !host.includes('ejemplo') &&
    !user.includes('tu_correo') &&
    !pass.includes('tu_contrasena')
  );
}

export function createMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false // Permite conexiones seguras en redes institucionales o certificados autofirmados
    }
  });
}

export async function sendRecoveryCodeEmail(
  toEmail: string,
  userName: string,
  code: string
): Promise<MailSendResult> {
  const fromAddress = process.env.SMTP_FROM || `DynaPro - SENA CLEM <${process.env.SMTP_USER || 'soporte.dynapro@sena.edu.co'}>`;

  if (!isSmtpConfigured()) {
    return {
      success: false,
      error: 'El servicio de correo SMTP no está configurado en el archivo .env. Configure SMTP_HOST, SMTP_USER y SMTP_PASS.'
    };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Restablecimiento de Contraseña - DynaPro SENA</title>
</head>
<body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5fceb; margin: 0; padding: 30px 10px; color: #171d13;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #dee5d4;">
    
    <!-- Encabezado con color institucional SENA -->
    <div style="background: linear-gradient(135deg, #226d00, #39a900); padding: 35px 30px; text-align: center; color: #ffffff;">
      <div style="width: 55px; height: 55px; background: #ffffff; border-radius: 50%; margin: 0 auto 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="font-size: 30px; color: #39a900; line-height: 55px;">&#9881;</span>
      </div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">DynaPro</h1>
      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">Centro Latinoamericano de Especies Menores (SENA CLEM)</p>
    </div>

    <!-- Cuerpo del mensaje -->
    <div style="padding: 35px 30px;">
      <h2 style="font-size: 19px; color: #171d13; margin-top: 0; font-weight: 700;">Restablecimiento de Contraseña</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Hola <strong>${userName}</strong>,
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en la plataforma <strong>DynaPro</strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #3f4a38;">
        Utiliza el siguiente código de verificación de 6 dígitos para autorizar el cambio:
      </p>

      <!-- Tarjeta del Código OTP -->
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

    <!-- Pie de página -->
    <div style="background: #f5fceb; border-top: 1px solid #dee5d4; padding: 18px 30px; text-align: center; font-size: 11px; color: #6f7b66;">
      &copy; ${new Date().getFullYear()} SENA - Centro Latinoamericano de Especies Menores (CLEM - Tuluá). Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

  try {
    const transporter = createMailTransporter();
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Código de verificación: ${code} - DynaPro SENA`,
      text: `Hola ${userName},\n\nTu código de verificación para restablecer tu contraseña en DynaPro es: ${code}\n\nEste código es válido por 15 minutos.\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
      html: htmlContent
    });

    console.log(`[DynaPro Email] Correo enviado exitosamente a ${toEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error(`[DynaPro Email] Error enviando correo a ${toEmail}:`, err.message);
    // En caso de fallo de red en SMTP real, registrar y advertir
    return {
      success: false,
      error: err.message
    };
  }
}
