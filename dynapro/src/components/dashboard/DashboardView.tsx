import React from 'react';
import { Project, User, TrainingGroup, ActivityLog, ActiveView } from '../../types';

interface DashboardViewProps {
  projects: Project[];
  users: User[];
  groups: TrainingGroup[];
  activityLogs: ActivityLog[];
  currentUser: User | null;
  setActiveView: (view: ActiveView) => void;
  onSelectProject: (project: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  users,
  groups,
  activityLogs,
  currentUser,
  setActiveView,
  onSelectProject
}) => {
  const activeProjects = projects.filter((p) => !p.is_deleted);
  const inExecutionProjects = activeProjects.filter((p) => p.status === 'EN EJECUCIÓN');
  const activeUsers = users.filter((u) => u.status === 'Activo');

  const totalBudget = activeProjects.reduce((acc, curr) => acc + (curr.total_budget || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Status counts
  const statusCounts = {
    EN_EJECUCION: inExecutionProjects.length,
    ACTIVO: activeProjects.filter((p) => p.status === 'ACTIVO').length,
    INACTIVO: activeProjects.filter((p) => p.status === 'INACTIVO').length,
    CANCELADO: activeProjects.filter((p) => p.status === 'CANCELADO').length
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="liquid-card rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8afd5d]/40 text-[#0c3400] border border-[#39a900]/30">
              Centro Latinoamericano de Especies Menores &bull; CLEM
            </span>
          </div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            ¡Bienvenido(a), {currentUser?.full_name || 'Investigador'}!
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1.5 leading-relaxed">
            Plataforma integral de formulación, seguimiento y archivo documental de proyectos de ciencia, tecnología e innovación SENA.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveView('new-project')}
            className="btn-liquid text-white font-montserrat font-bold text-sm px-6 h-12 rounded-full flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Nuevo Proyecto
          </button>
          <button
            onClick={() => setActiveView('projects')}
            className="bg-white/80 hover:bg-white text-[#171d13] border border-[#becbb3] font-montserrat font-semibold text-sm px-5 h-12 rounded-full flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#39a900]">science</span>
            Ver Repositorio
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider">
              Total Proyectos
            </span>
            <span className="p-2 bg-[#8afd5d]/20 text-[#226d00] rounded-xl material-symbols-outlined text-[20px]">
              inventory_2
            </span>
          </div>
          <div className="text-3xl font-montserrat font-extrabold text-[#171d13]">
            {activeProjects.length}
          </div>
          <p className="text-xs text-[#3f4a38] mt-1 flex items-center gap-1">
            <span className="text-[#226d00] font-bold">100%</span> vigentes en repositorio
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider">
              En Ejecución
            </span>
            <span className="p-2 bg-[#769b95]/20 text-[#416560] rounded-xl material-symbols-outlined text-[20px]">
              pending_actions
            </span>
          </div>
          <div className="text-3xl font-montserrat font-extrabold text-[#416560]">
            {inExecutionProjects.length}
          </div>
          <p className="text-xs text-[#3f4a38] mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-[#416560] rounded-full animate-pulse mr-1" />
            Con cronograma activo
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider">
              Investigadores
            </span>
            <span className="p-2 bg-[#b5dcfe]/40 text-[#3c627f] rounded-xl material-symbols-outlined text-[20px]">
              groups
            </span>
          </div>
          <div className="text-3xl font-montserrat font-extrabold text-[#171d13]">
            {activeUsers.length}
          </div>
          <p className="text-xs text-[#3f4a38] mt-1">Instructores y aprendices</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider">
              Presupuesto I+D+i
            </span>
            <span className="p-2 bg-[#8afd5d]/20 text-[#226d00] rounded-xl material-symbols-outlined text-[20px]">
              payments
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-montserrat font-extrabold text-[#226d00] truncate">
            {formatCurrency(totalBudget)}
          </div>
          <p className="text-xs text-[#3f4a38] mt-1">Inversión SENA CLEM</p>
        </div>
      </div>

      {/* Main Content Grid: Projects Spotlight & Real-time Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Featured Projects (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#39a900]">science</span>
              <h2 className="font-montserrat text-xl font-bold text-[#171d13]">
                Proyectos Recientes
              </h2>
            </div>
            <button
              onClick={() => setActiveView('projects')}
              className="text-xs text-[#226d00] font-bold hover:underline"
            >
              Explorar todos ({activeProjects.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="liquid-card liquid-card-hover rounded-2xl p-5 border border-white/60 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eff6e5] text-[#226d00]">
                      {project.status}
                    </span>
                    <span className="text-xs font-bold text-[#226d00]">{project.progress}%</span>
                  </div>
                  <h3 className="font-montserrat text-sm font-bold text-[#171d13] line-clamp-2 mb-2 hover:text-[#226d00] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[#3f4a38] line-clamp-2 mb-3">
                    {project.executive_summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#dee5d4]">
                  <div className="h-1.5 w-full bg-[#dee5d4] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#39a900] rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6f7b66]">
                    <span>{project.start_date}</span>
                    <span>{project.attachments?.length || 0} anexos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Breakdown Bar */}
          <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm">
            <h3 className="font-montserrat text-sm font-bold text-[#171d13] mb-4">
              Distribución por Estado de Proyecto
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#171d13] mb-1">
                  <span>En Ejecución</span>
                  <span>{statusCounts.EN_EJECUCION} proyectos</span>
                </div>
                <div className="h-2 w-full bg-[#dee5d4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#416560] rounded-full"
                    style={{
                      width: `${(statusCounts.EN_EJECUCION / (activeProjects.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#171d13] mb-1">
                  <span>Activo / En Formulación</span>
                  <span>{statusCounts.ACTIVO} proyectos</span>
                </div>
                <div className="h-2 w-full bg-[#dee5d4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#39a900] rounded-full"
                    style={{
                      width: `${(statusCounts.ACTIVO / (activeProjects.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#171d13] mb-1">
                  <span>Inactivo / Archivado</span>
                  <span>{statusCounts.INACTIVO} proyectos</span>
                </div>
                <div className="h-2 w-full bg-[#dee5d4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6f7b66] rounded-full"
                    style={{
                      width: `${(statusCounts.INACTIVO / (activeProjects.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Audit & Quick Actions (1 col) */}
        <div className="space-y-6">
          {/* Real-time Audit Feed */}
          <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-[#dee5d4] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3c627f]">history</span>
                <h3 className="font-montserrat text-base font-bold text-[#171d13]">
                  Auditoría Reciente
                </h3>
              </div>
              {currentUser?.role === 'ADMINISTRADOR' && (
                <button
                  onClick={() => setActiveView('activity-log')}
                  className="text-[11px] text-[#226d00] font-bold hover:underline cursor-pointer"
                >
                  Ver todo →
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs p-3 rounded-xl bg-[#eff6e5]/60 border border-[#dee5d4]/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#171d13]">{log.action_label}</span>
                    <span className="text-[10px] text-[#6f7b66]">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  </div>
                  <p className="text-[#3f4a38] text-[11px] leading-snug">{log.detail}</p>
                  <p className="text-[10px] text-[#6f7b66] mt-1 font-mono">Por: {log.user_name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info / Master Data summary */}
          <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-sm bg-gradient-to-br from-white/90 to-[#eff6e5]/50">
            <h3 className="font-montserrat text-sm font-bold text-[#171d13] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#39a900]">database</span>
              Datos Maestros CLEM
            </h3>
            <p className="text-xs text-[#3f4a38] mb-4">
              Centro Latinoamericano de Especies Menores con sede en Tuluá, Valle del Cauca.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/70 border border-[#dee5d4]">
                <span className="font-medium text-[#3f4a38]">Fichas Activas</span>
                <span className="font-bold text-[#171d13]">{groups.length} grupos</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/70 border border-[#dee5d4]">
                <span className="font-medium text-[#3f4a38]">Usuarios Registrados</span>
                <span className="font-bold text-[#171d13]">{users.length} usuarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
