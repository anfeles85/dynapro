import React, { useState } from 'react';
import { User } from '../../types';
import { apiChangePassword } from '../../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onToast
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser) {
      setErrorMsg('No hay una sesión de usuario activa.');
      return;
    }

    // Client-side validations
    if (!currentPassword) {
      setErrorMsg('Debe ingresar su contraseña actual.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Debe ingresar la nueva contraseña.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiChangePassword(
        currentUser.id,
        currentUser.email,
        currentPassword,
        newPassword
      );

      const successText = res.message || 'Contraseña actualizada exitosamente.';
      setSuccessMsg(successText);
      if (onToast) {
        onToast('success', 'Seguridad Actualizada', successText);
      }

      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto close after 1.5 seconds or let user close
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      const message = err.message || 'Error al intentar cambiar la contraseña.';
      setErrorMsg(message);
      if (onToast) {
        onToast('error', 'Error al Cambiar Contraseña', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatch = confirmPassword && newPassword !== confirmPassword;
  const hasMinLength = newPassword.length >= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl z-10 border border-white/60 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#dee5d4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39a900]/15 border border-[#39a900]/30 flex items-center justify-center text-[#226d00] shadow-sm">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-lg text-[#171d13] flex items-center gap-2">
                Cambiar Contraseña
              </h3>
              <p className="text-xs text-[#6f7b66]">
                Actualiza tus credenciales de acceso a DynaPro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-[#6f7b66] hover:text-[#171d13] hover:bg-[#eff6e5] transition-colors cursor-pointer disabled:opacity-50"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* User context card */}
        <div className="p-3 bg-[#eff6e5]/80 rounded-2xl border border-[#dee5d4] flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-[#39a900]/20 flex items-center justify-center font-bold text-[#226d00] shrink-0">
            {currentUser?.full_name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="truncate">
            <span className="font-bold text-[#171d13] block truncate">
              {currentUser?.full_name || 'Usuario'}
            </span>
            <span className="text-[#3c627f] font-mono text-[11px] block truncate">
              {currentUser?.email}
            </span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-xs text-[#93000a] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-[#d1f7c4] border border-[#39a900]/40 text-xs text-[#135300] flex items-start gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
            <div className="flex-1 font-bold">{successMsg}</div>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="currentPassword">
              Contraseña Actual <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3c627f]">
                <span className="material-symbols-outlined text-[18px] opacity-75">key</span>
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#171d13] focus:bg-white focus:border-[#39a900] outline-none transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6f7b66] hover:text-[#171d13] cursor-pointer"
                title={showCurrentPassword ? 'Ocultar' : 'Mostrar'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showCurrentPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#3f4a38]" htmlFor="newPassword">
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3c627f]">
                <span className="material-symbols-outlined text-[18px] opacity-75">lock</span>
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#171d13] focus:bg-white focus:border-[#39a900] outline-none transition-all"
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6f7b66] hover:text-[#171d13] cursor-pointer"
                title={showNewPassword ? 'Ocultar' : 'Mostrar'}
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
              <label className="block text-xs font-semibold text-[#3f4a38]" htmlFor="confirmPassword">
                Confirmar Nueva Contraseña <span className="text-[#ba1a1a]">*</span>
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3c627f]">
                <span className="material-symbols-outlined text-[18px] opacity-75">verified</span>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`w-full bg-[#eff6e5] border rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#171d13] focus:bg-white outline-none transition-all ${
                  isMismatch
                    ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
                    : isMatching
                    ? 'border-[#39a900] focus:border-[#39a900]'
                    : 'border-transparent focus:border-[#39a900]'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6f7b66] hover:text-[#171d13] cursor-pointer"
                title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Policy hint */}
          <div className="text-[11px] text-[#6f7b66] bg-[#f7f9fb] p-2.5 rounded-xl border border-[#dee5d4]/60 space-y-1">
            <p className="font-semibold text-[#3f4a38] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#39a900]">shield</span>
              Requisitos de seguridad:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px] pl-1">
              <li>Mínimo 6 caracteres de longitud</li>
              <li>Diferente de la contraseña actual</li>
              <li>Almacenada con cifrado seguro bcrypt</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#dee5d4]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3f4a38] hover:bg-[#eff6e5] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && !isMatching) || (newPassword.length > 0 && !hasMinLength)}
              className="btn-liquid text-white font-montserrat font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  Actualizando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Guardar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
