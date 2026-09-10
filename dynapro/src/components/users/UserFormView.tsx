import React, { useState } from 'react';
import { User, ActiveView, UserRole } from '../../types';

interface UserFormViewProps {
  initialUser?: User | null;
  currentUser: User | null;
  onSave: (userData: Partial<User>) => void;
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const UserFormView: React.FC<UserFormViewProps> = ({
  initialUser,
  currentUser,
  onSave,
  setActiveView,
  onToast
}) => {
  const isEditing = !!initialUser;

  const [fullName, setFullName] = useState(initialUser?.full_name || '');
  const [docType, setDocType] = useState(initialUser?.document_type || 'Cédula de Ciudadanía');
  const [document, setDocument] = useState(initialUser?.document || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [phone, setPhone] = useState(initialUser?.phone || '');
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'INSTRUCTOR');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>(initialUser?.status || 'Activo');

  const handleSubmit = (e: React.FormEvent) => {
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
      onToast('error', 'Correo Inválido', 'Ingrese un correo electrónico institucional válido.');
      return;
    }

    const payload: Partial<User> = {
      full_name: fullName.trim(),
      document_type: docType,
      document: document.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      status
    };

    onSave(payload);
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7b66] mb-2">
          <button
            onClick={() => setActiveView('users')}
            className="hover:text-[#226d00] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Gestión de Usuarios
          </button>
          <span>/</span>
          <span className="text-[#171d13]">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
        </div>

        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
          {isEditing ? 'Editar Usuario Institucional' : 'Registrar Nuevo Usuario'}
        </h1>
        <p className="text-sm text-[#3f4a38] mt-1">
          Complete los datos personales, de contacto y asigne el rol de seguridad RBAC correspondiente.
        </p>
      </div>

      {/* Main Card */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-[#dee5d4] pb-4">
          <span className="material-symbols-outlined text-[#39a900] p-2 bg-[#8afd5d]/20 rounded-xl">
            badge
          </span>
          <h3 className="font-montserrat text-lg font-bold text-[#171d13]">
            Información del Perfil
          </h3>
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
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer"
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

          {/* Role (RBAC) */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="role">
              Rol de Seguridad (RBAC) <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
            >
              <option value="INSTRUCTOR">Instructor &bull; Formulación y Edición</option>
              <option value="APRENDIZ">Aprendiz &bull; Coautoría y Consulta</option>
              <option value="ADMINISTRADOR">Administrador &bull; Control Total y Usuarios</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="status">
              Estado de la Cuenta <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Activo' | 'Inactivo')}
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
            >
              <option value="Activo">Activo (Permite inicio de sesión)</option>
              <option value="Inactivo">Inactivo (Bloquea inicio de sesión)</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#dee5d4]">
          <button
            type="button"
            onClick={() => setActiveView('users')}
            className="px-6 py-3 rounded-xl font-montserrat text-sm font-bold text-[#171d13] hover:bg-[#dee5d4] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-liquid text-white font-montserrat font-bold text-sm px-8 py-3 rounded-xl shadow-md cursor-pointer"
          >
            {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};
