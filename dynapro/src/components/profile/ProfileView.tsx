import React, { useState } from 'react';
import { User, ActiveView } from '../../types';

interface ProfileViewProps {
  currentUser: User;
  onSave: (userData: Partial<User>) => Promise<void> | void;
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSave,
  setActiveView,
  onToast
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [docType, setDocType] = useState(currentUser.document_type || 'Cédula de Ciudadanía');
  const [document, setDocument] = useState(currentUser.document || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      onToast('error', 'Campo Requerido', 'El nombre completo es obligatorio.');
      return;
    }

    if (!document.trim()) {
      onToast('error', 'Campo Requerido', 'El número de documento es obligatorio.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      onToast('error', 'Correo Inválido', 'Ingrese un correo electrónico válido.');
      return;
    }

    const payload: Partial<User> = {
      full_name: fullName.trim(),
      document_type: docType,
      document: document.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    };

    setIsSaving(true);
    try {
      await onSave(payload);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/30';
      case 'INSTRUCTOR':
        return 'bg-[#39a900]/15 text-[#226d00] border-[#39a900]/40';
      case 'APRENDIZ':
        return 'bg-[#b5dcfe]/40 text-[#3b617e] border-[#b5dcfe]';
      default:
        return 'bg-[#eff6e5] text-[#3f4a38] border-[#dee5d4]';
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-8">
      {/* Top Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7b66] mb-2">
          <button
            type="button"
            onClick={() => setActiveView('projects')}
            className="hover:text-[#226d00] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Banco de Proyectos
          </button>
          <span>/</span>
          <span className="text-[#171d13]">Mi Perfil</span>
        </div>

        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
          Mi Perfil de Usuario
        </h1>
        <p className="text-sm text-[#3f4a38] mt-1">
          Visualiza y actualiza tu información personal y datos de contacto en la plataforma DynaPro.
        </p>
      </div>

      {/* User Summary Card */}
      <div className="liquid-card rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#8afd5d]/30 border-2 border-[#39a900]/40 flex items-center justify-center shadow-md">
            <span className="font-montserrat text-3xl font-extrabold text-[#226d00]">
              {fullName?.slice(0, 2).toUpperCase() || 'US'}
            </span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="font-montserrat text-xl md:text-2xl font-bold text-[#171d13]">
              {fullName || currentUser.full_name}
            </h2>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border self-center sm:self-auto ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              {currentUser.role}
            </span>
          </div>
          <p className="text-sm text-[#3f4a38] font-mono">{email || currentUser.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#6f7b66]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#39a900]">badge</span>
              {docType}: {document || currentUser.document}
            </span>
            {phone && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#3c627f]">call</span>
                {phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-[#dee5d4] pb-4">
          <span className="material-symbols-outlined text-[#39a900] p-2 bg-[#8afd5d]/20 rounded-xl">
            manage_accounts
          </span>
          <div>
            <h3 className="font-montserrat text-lg font-bold text-[#171d13]">
              Datos del Formulario
            </h3>
            <p className="text-xs text-[#6f7b66]">
              Edita tus datos personales. El rol es de solo lectura y el estado es administrado por el sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="fullName">
              Nombre Completo <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Carlos Eduardo Ramírez Peña"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all"
            />
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="docType">
              Tipo de Documento <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-medium"
            >
              <option value="Cédula de Ciudadanía">Cédula de Ciudadanía (C.C.)</option>
              <option value="Tarjeta de Identidad">Tarjeta de Identidad (T.I.)</option>
              <option value="Cédula de Extranjería">Cédula de Extranjería (C.E.)</option>
              <option value="Pasaporte">Pasaporte (PAS)</option>
            </select>
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="document">
              Número de Documento <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="document"
              type="text"
              required
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="Ej. 1118234901"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all font-mono"
            />
          </div>

          {/* Institutional Email */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="email">
              Correo Institucional <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@sena.edu.co"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="phone">
              Teléfono de Contacto
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 312 456 7890"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all"
            />
          </div>

          {/* Role (Read-Only) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#3f4a38]">
                Rol de Seguridad (RBAC)
              </label>
              <span className="text-[11px] text-[#6f7b66] flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Solo lectura (asignado por Administrador)
              </span>
            </div>
            <div className="w-full bg-[#dee5d4]/40 border border-[#dee5d4] rounded-xl py-3 px-4 text-sm text-[#3f4a38] font-bold flex items-center justify-between cursor-not-allowed select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#39a900] text-[20px]">
                  verified_user
                </span>
                <span>{currentUser.role}</span>
              </div>
              <span className="text-xs font-normal text-[#6f7b66]">
                {currentUser.role === 'INSTRUCTOR'
                  ? 'Formulación, edición y gestión de proyectos'
                  : currentUser.role === 'APRENDIZ'
                  ? 'Coautoría, consulta y vinculación a fichas'
                  : 'Administración global'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#dee5d4]">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setActiveView('projects')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#3f4a38] hover:bg-[#eff6e5] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-liquid text-white font-montserrat font-bold text-sm px-7 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar Perfil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
