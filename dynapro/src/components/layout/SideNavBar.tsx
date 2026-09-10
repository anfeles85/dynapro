import React from 'react';
import { ActiveView, User } from '../../types';

interface SideNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onLogout
}) => {
  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  // Group views to determine active navigation tab
  const isDashboardActive = activeView === 'dashboard';
  const isProjectsActive = activeView === 'projects' || activeView === 'new-project' || activeView === 'edit-project';
  const isUsersActive = activeView === 'users' || activeView === 'new-user' || activeView === 'edit-user';
  const isMasterDataActive =
    activeView === 'groups' ||
    activeView === 'new-group' ||
    activeView === 'edit-group' ||
    activeView === 'centers' ||
    activeView === 'new-center' ||
    activeView === 'edit-center' ||
    activeView === 'activity-log';

  return (
    <aside className="h-full w-64 fixed left-0 top-0 bg-[#ffffff]/70 backdrop-blur-xl border-r border-white/30 shadow-[0_8px_32px_0_rgba(0,50,77,0.08)] flex flex-col py-8 px-6 z-40 hidden md:flex">
      {/* Brand Header */}
      <div className="mb-10 cursor-pointer" onClick={() => setActiveView('projects')}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-[#226d00] flex items-center justify-center shadow-md shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
              alt="SENA Logo"
              className="w-6 h-6 invert brightness-0 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-montserrat text-xl font-bold text-[#39a900] leading-tight">DynaPro</h1>
            <p className="text-xs text-[#3f4a38] font-medium leading-tight">Banco de proyectos</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {/* Tablero (Dashboard) */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full ${
            isDashboardActive
              ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
              : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-sm font-medium">Tablero</span>
        </button>

        {/* Proyectos */}
        <button
          onClick={() => setActiveView('projects')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full ${
            isProjectsActive
              ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
              : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">science</span>
          <span className="text-sm font-medium">Proyectos</span>
        </button>

        {/* Usuarios (Accessible to all or restricted with indicator) */}
        {/* Usuarios (Solo administradores) */}
        {isAdmin && (
          <button
            onClick={() => setActiveView('users')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left w-full cursor-pointer ${
              isUsersActive
                ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
                : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="text-sm font-medium">Usuarios</span>
            </div>
          </button>
        )}

        {/* Datos Maestros (Administradores) o Acceso a Grupos (Instructores) */}
        {isAdmin ? (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveView('groups')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full cursor-pointer ${
                isMasterDataActive
                  ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
                  : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">database</span>
              <span className="text-sm font-medium">Datos Maestros</span>
            </button>

            {isMasterDataActive && (
              <div className="ml-8 flex flex-col gap-1 border-l-2 border-[#dee5d4] pl-3 py-1">
                <button
                  onClick={() => setActiveView('groups')}
                  className={`text-xs py-1.5 text-left rounded px-2 transition-colors cursor-pointer ${
                    activeView === 'groups' || activeView === 'new-group' || activeView === 'edit-group'
                      ? 'text-[#226d00] font-bold bg-[#e9f0df]'
                      : 'text-[#3f4a38] hover:text-[#226d00]'
                  }`}
                >
                  Grupos de Formación
                </button>
                <button
                  onClick={() => setActiveView('centers')}
                  className={`text-xs py-1.5 text-left rounded px-2 transition-colors cursor-pointer ${
                    activeView === 'centers' || activeView === 'new-center' || activeView === 'edit-center'
                      ? 'text-[#226d00] font-bold bg-[#e9f0df]'
                      : 'text-[#3f4a38] hover:text-[#226d00]'
                  }`}
                >
                  Centros de Formación
                </button>
                <button
                  onClick={() => setActiveView('activity-log')}
                  className={`text-xs py-1.5 text-left rounded px-2 transition-colors cursor-pointer ${
                    activeView === 'activity-log'
                      ? 'text-[#226d00] font-bold bg-[#e9f0df]'
                      : 'text-[#3f4a38] hover:text-[#226d00]'
                  }`}
                >
                  Log de Actividades
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Vista directa de Grupos de Formación para Instructores */
          <button
            onClick={() => setActiveView('groups')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full cursor-pointer ${
              activeView === 'groups' || activeView === 'new-group' || activeView === 'edit-group'
                ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
                : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">school</span>
            <span className="text-sm font-medium">Grupos de Formación</span>
          </button>
        )}

        {/* Mi Perfil */}
        <button
          onClick={() => setActiveView('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full cursor-pointer ${
            activeView === 'profile'
              ? 'text-[#39a900] font-bold border-r-4 border-[#39a900] bg-[#8afd5d]/20'
              : 'text-[#3f4a38] font-medium hover:bg-[#8afd5d]/20 hover:text-[#39a900]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">account_circle</span>
          <span className="text-sm font-medium">Mi Perfil</span>
        </button>
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-[#dee5d4]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-all text-left w-full font-medium"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
