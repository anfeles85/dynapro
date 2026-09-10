import React, { useState } from 'react';
import { ActiveView } from '../../types';
import { apiSendRecoveryCode, apiVerifyRecoveryCode } from '../../services/api';

interface ForgotPasswordViewProps {
  setActiveView: (view: ActiveView) => void;
  onSuccess: (msg: string) => void;
}

type RecoveryStep = 'request' | 'verify' | 'success';

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  setActiveView,
  onSuccess
}) => {
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Step 1: Solicitar código OTP al correo
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      const res = await apiSendRecoveryCode(cleanEmail);
      setInfoMsg(res.message || `Código enviado a ${cleanEmail}`);
      setStep('verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await apiSendRecoveryCode(email.trim().toLowerCase());
      setInfoMsg('Se ha enviado un nuevo código de verificación.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verificar código y aplicar nueva contraseña
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Por favor ingresa el código de 6 dígitos completo.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Debes ingresar tu nueva contraseña.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La confirmación de la contraseña no coincide.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiVerifyRecoveryCode(email.trim().toLowerCase(), cleanCode, newPassword);
      setStep('success');
      onSuccess(res.message || 'Contraseña restablecida exitosamente.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatch = confirmPassword && newPassword !== confirmPassword;
  const hasMinLength = newPassword.length >= 6;

  return (
    <div className="min-h-screen bg-[#2c3227] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Gradients for Liquid Feel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#226d00]/25 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#3c627f]/25 blur-[120px]" />
      </div>

      {/* Main Glass Card */}
      <div className="glass-panel rounded-3xl w-full max-w-md p-6 sm:p-10 relative z-10 flex flex-col shadow-2xl border border-white/40 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#39a900] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-3 border border-white/40">
            <span className="material-symbols-outlined text-[32px]">science</span>
          </div>
          <h1 className="font-montserrat text-2xl font-extrabold text-[#171d13] tracking-tight">
            DynaPro
          </h1>
          <p className="text-xs font-semibold text-[#6f7b66] uppercase tracking-wider mt-0.5">
            SENA CLEM &bull; Recuperación de Cuenta
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-xs text-[#93000a] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {infoMsg && step === 'verify' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#eff6e5] border border-[#39a900]/30 text-xs text-[#0c3400] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[#39a900] text-[18px] shrink-0 mt-0.5">mark_email_read</span>
            <div>
              <p className="font-bold">¡Código enviado!</p>
              <p className="mt-0.5 text-[#3f4a38]">{infoMsg}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 1: SOLICITAR CÓDIGO */}
        {/* ========================================================================= */}
        {step === 'request' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="font-montserrat text-xl font-bold text-[#171d13]">
                Restablecer Contraseña
              </h2>
              <p className="text-xs text-[#3f4a38] mt-1.5 leading-relaxed">
                Ingresa tu correo electrónico institucional para enviarte un código de seguridad de 6 dígitos.
              </p>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5 text-left" htmlFor="email">
                  Correo Institucional
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#6f7b66] text-[20px]">
                    mail
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@sena.edu.co"
                    className="w-full h-12 pl-11 pr-4 bg-[#dee5d4]/80 border border-transparent rounded-xl text-sm text-[#171d13] focus:bg-white focus:border-[#226d00] outline-none transition-all placeholder:text-[#6f7b66]"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-liquid w-full h-12 bg-[#39a900] text-white rounded-xl font-montserrat font-bold text-sm hover:bg-[#226d00] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Enviando código...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Código de Verificación</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="text-xs text-[#226d00] font-semibold hover:underline transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: INGRESAR CÓDIGO OTP Y NUEVA CONTRASEÑA */}
        {/* ========================================================================= */}
        {step === 'verify' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="font-montserrat text-xl font-bold text-[#171d13]">
                Verifica tu Identidad
              </h2>
              <p className="text-xs text-[#3f4a38] mt-1 leading-relaxed">
                Ingresa el código enviado a <strong className="font-mono text-[#171d13]">{email}</strong> y define tu nueva contraseña.
              </p>
            </div>

            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {/* Código OTP de 6 dígitos */}
              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5 text-left" htmlFor="code">
                  Código de Seguridad (6 dígitos) <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#39a900] text-[20px]">
                    pin
                  </span>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength={6}
                    required
                    disabled={loading}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full h-12 pl-11 pr-4 bg-[#dee5d4]/80 border border-transparent rounded-xl text-center font-mono font-extrabold text-lg tracking-[6px] text-[#171d13] focus:bg-white focus:border-[#39a900] outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-[#6f7b66]"
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#3f4a38] text-left" htmlFor="newPassword">
                    Nueva Contraseña <span className="text-[#ba1a1a]">*</span>
                  </label>
                  {newPassword && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasMinLength
                          ? 'bg-[#8afd5d]/30 text-[#0c3400]'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      {hasMinLength ? 'Longitud válida' : 'Mínimo 6 caracteres'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#6f7b66] text-[20px]">
                    lock
                  </span>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-12 pl-11 pr-10 bg-[#dee5d4]/80 border border-transparent rounded-xl text-sm text-[#171d13] focus:bg-white focus:border-[#226d00] outline-none transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-[#6f7b66] hover:text-[#171d13] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#3f4a38] text-left" htmlFor="confirmPassword">
                    Confirmar Contraseña <span className="text-[#ba1a1a]">*</span>
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isMatching
                          ? 'bg-[#8afd5d]/30 text-[#0c3400]'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isMatching ? 'check' : 'close'}
                      </span>
                      {isMatching ? 'Coinciden' : 'No coinciden'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#6f7b66] text-[20px]">
                    verified
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className={`w-full h-12 pl-11 pr-10 bg-[#dee5d4]/80 border rounded-xl text-sm text-[#171d13] focus:bg-white outline-none transition-all ${
                      isMismatch
                        ? 'border-[#ba1a1a]'
                        : isMatching
                        ? 'border-[#39a900]'
                        : 'border-transparent focus:border-[#226d00]'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#6f7b66] hover:text-[#171d13] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 6 || !hasMinLength || !isMatching}
                className="btn-liquid w-full h-12 bg-[#39a900] text-white rounded-xl font-montserrat font-bold text-sm hover:bg-[#226d00] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    <span>Restablecer y Guardar Contraseña</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-[#226d00] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Reenviar código
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setCode('');
                    setErrorMsg(null);
                  }}
                  className="text-[#6f7b66] hover:text-[#171d13] font-medium cursor-pointer"
                >
                  Cambiar correo
                </button>
              </div>

              <div className="pt-2 text-center border-t border-[#dee5d4]/60">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="text-xs text-[#226d00] font-semibold hover:underline transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: PANTALLA DE ÉXITO */}
        {/* ========================================================================= */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#39a900]/20 border-2 border-[#39a900] flex items-center justify-center text-[#226d00] mx-auto shadow-md">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div>
              <h2 className="font-montserrat text-xl font-bold text-[#171d13]">
                ¡Contraseña Restablecida!
              </h2>
              <p className="text-xs text-[#3f4a38] mt-2 leading-relaxed max-w-xs mx-auto">
                Tu contraseña ha sido actualizada exitosamente en el sistema. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="btn-liquid w-full h-12 bg-[#39a900] text-white rounded-xl font-montserrat font-bold text-sm hover:bg-[#226d00] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Iniciar Sesión Ahora</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
