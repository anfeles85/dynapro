import React, { useState, useMemo } from 'react';
import { User, ActiveView } from '../../types';

interface UsersListViewProps {
  users: User[];
  currentUser: User | null;
  setActiveView: (view: ActiveView) => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
}

export const UsersListView: React.FC<UsersListViewProps> = ({
  users,
  currentUser,
  setActiveView,
  onEditUser,
  onToggleStatus,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = u.full_name.toLowerCase().includes(query);
        const matchEmail = u.email.toLowerCase().includes(query);
        const matchDoc = u.document.includes(query);
        if (!matchName && !matchEmail && !matchDoc) return false;
      }

      if (selectedRole !== 'ALL' && u.role !== selectedRole) {
        return false;
      }

      if (selectedStatus !== 'ALL' && u.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1">
            Administración de cuentas, roles institucionales y permisos de acceso RBAC.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setActiveView('new-user')}
            className="btn-liquid text-white font-montserrat font-bold text-sm px-6 h-12 rounded-full flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Registrar Nuevo Usuario
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-[#eff6e5] border border-[#3c627f]/30 flex items-center gap-3 text-xs text-[#3f4a38]">
          <span className="material-symbols-outlined text-[#3c627f] text-[22px]">info</span>
          <div>
            <p className="font-bold text-[#171d13]">Modo de Solo Lectura (RBAC)</p>
            <p>
              Estás conectado con el rol <strong>{currentUser?.role}</strong>. Solo los administradores pueden crear o modificar usuarios.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="liquid-card rounded-2xl p-6 mb-8 border border-white/60 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f4a38]/70 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, documento o correo..."
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-[#171d13] outline-none h-12"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer"
            >
              <option value="ALL">Todos los Roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="APRENDIZ">Aprendiz</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f0df]/80 border-b border-[#dee5d4] text-[11px] font-bold text-[#6f7b66] uppercase tracking-wider">
                <th className="py-4 px-6">Usuario & Correo</th>
                <th className="py-4 px-6">Documento</th>
                <th className="py-4 px-6">Rol</th>
                <th className="py-4 px-6">Teléfono</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee5d4]/60 text-sm">
              {filteredUsers.map((user) => {
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#eff6e5]/50 transition-colors"
                  >
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8afd5d]/30 text-[#0c3400] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-[#39a900]/20">
                          {user.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#171d13] flex items-center gap-1.5">
                            {user.full_name}
                            {isSelf && (
                              <span className="text-[10px] bg-[#eff6e5] text-[#226d00] font-bold px-1.5 py-0.2 rounded border border-[#39a900]/30">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#3c627f]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Document */}
                    <td className="py-4 px-6 text-xs text-[#3f4a38] font-mono">
                      {user.document_type || 'C.C.'} {user.document}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                          user.role === 'ADMINISTRADOR'
                            ? 'bg-[#8afd5d]/30 text-[#0c3400] border border-[#39a900]/30'
                            : user.role === 'INSTRUCTOR'
                            ? 'bg-[#b5dcfe]/50 text-[#3b617e] border border-[#b5dcfe]'
                            : 'bg-[#e9f0df] text-[#416560] border border-[#dee5d4]'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-xs text-[#3f4a38]">
                      {user.phone || 'No registrado'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          user.status === 'Activo'
                            ? 'bg-[#8afd5d]/20 text-[#0c3400]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Activo' ? 'bg-[#39a900]' : 'bg-[#ba1a1a]'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-1.5 text-[#3c627f] hover:text-[#171d13] hover:bg-[#dee5d4] rounded-lg transition-colors"
                            title="Editar usuario"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            onClick={() => onToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'Activo'
                                ? 'text-[#6f7b66] hover:text-[#ba1a1a] hover:bg-[#ffdad6]'
                                : 'text-[#39a900] hover:bg-[#eff6e5]'
                            }`}
                            title={user.status === 'Activo' ? 'Inactivar cuenta' : 'Activar cuenta'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {user.status === 'Activo' ? 'block' : 'check_circle'}
                            </span>
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#6f7b66]">Sin permiso</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
