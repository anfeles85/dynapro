import React, { useState, useMemo } from 'react';
import { Project, User, ActiveView, TrainingGroup, TrainingCenter } from '../../types';

interface ProjectsBankViewProps {
  projects: Project[];
  allUsers: User[];
  allGroups: TrainingGroup[];
  allCenters: TrainingCenter[];
  currentUser: User | null;
  setActiveView: (view: ActiveView) => void;
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onQuickStatusChange: (projectId: number, newStatus: Project['status']) => void;
}

export const ProjectsBankView: React.FC<ProjectsBankViewProps> = ({
  projects,
  allUsers,
  allGroups,
  allCenters,
  currentUser,
  setActiveView,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onQuickStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  // Get author names for a project
  const getAuthorsNames = (authorIds: number[]): string => {
    const authors = allUsers.filter((u) => authorIds.includes(u.id));
    if (authors.length === 0) return 'Sin autor asignado';
    return authors.map((a) => a.full_name).join(', ');
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (p.is_deleted) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = p.name.toLowerCase().includes(query);
        const matchSummary = p.executive_summary.toLowerCase().includes(query);
        const matchKeywords = p.keywords.some((kw) => kw.toLowerCase().includes(query));
        const authorNames = getAuthorsNames(p.author_ids).toLowerCase();
        const matchAuthors = authorNames.includes(query);

        if (!matchTitle && !matchSummary && !matchKeywords && !matchAuthors) {
          return false;
        }
      }

      // Filter by Group
      if (selectedGroup) {
        const groupId = parseInt(selectedGroup, 10);
        if (!p.training_group_ids.includes(groupId)) {
          return false;
        }
      }

      // Filter by Status
      if (selectedStatus !== 'ALL') {
        if (p.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [projects, searchTerm, selectedGroup, selectedStatus, allUsers]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGroup('');
    setSelectedStatus('ALL');
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Page Header & Register Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            Banco de Proyectos
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1">
            Gestiona y explora el repositorio de investigación del CLEM.
          </p>
        </div>

        <button
          onClick={() => setActiveView('new-project')}
          className="btn-liquid text-white font-montserrat font-bold text-sm md:text-base px-7 h-13 rounded-full flex items-center justify-center gap-2 hover:shadow-lg shadow-md transition-all w-full sm:w-auto active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Registrar Nuevo Proyecto
        </button>
      </div>

      {/* Filters Bar Area (Liquid Card) */}
      <div className="liquid-card rounded-2xl p-6 mb-8 border border-white/50 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search keyword or title */}
          <div className="md:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3f4a38]/70 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Palabra clave o título..."
              className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-sm text-[#171d13] focus:outline-none transition-shadow h-12"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f7b66] hover:text-[#171d13]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Group dropdown */}
          <div className="md:col-span-2 relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] focus:outline-none transition-shadow h-12 cursor-pointer"
            >
              <option value="">Grupo de Formación</option>
              {allGroups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  Ficha {grp.number} - {grp.training_program}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Status Chips */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#dee5d4]/60 overflow-x-auto text-xs">
          <span className="font-semibold text-[#6f7b66] mr-1">Estado:</span>
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${selectedStatus === 'ALL'
              ? 'bg-[#39a900] text-white font-bold'
              : 'bg-[#eff6e5] text-[#3f4a38] hover:bg-[#dee5d4]'
              }`}
          >
            Todos ({projects.filter((p) => !p.is_deleted).length})
          </button>
          <button
            onClick={() => setSelectedStatus('EN EJECUCIÓN')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${selectedStatus === 'EN EJECUCIÓN'
              ? 'bg-[#416560] text-white font-bold'
              : 'bg-[#eff6e5] text-[#3f4a38] hover:bg-[#dee5d4]'
              }`}
          >
            En Ejecución
          </button>
          <button
            onClick={() => setSelectedStatus('ACTIVO')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${selectedStatus === 'ACTIVO'
              ? 'bg-[#226d00] text-white font-bold'
              : 'bg-[#eff6e5] text-[#3f4a38] hover:bg-[#dee5d4]'
              }`}
          >
            Activos
          </button>
          <button
            onClick={() => setSelectedStatus('INACTIVO')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${selectedStatus === 'INACTIVO'
              ? 'bg-[#6f7b66] text-white font-bold'
              : 'bg-[#eff6e5] text-[#3f4a38] hover:bg-[#dee5d4]'
              }`}
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="liquid-card liquid-card-hover rounded-2xl p-6 flex flex-col h-full cursor-pointer group relative overflow-visible border border-white/50"
              >
                {/* Status and Quick Action */}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  {project.status === 'EN EJECUCIÓN' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#769b95]/15 text-[#0b322e] text-xs font-semibold border border-[#769b95]/30">
                      <span className="w-1.5 h-1.5 bg-[#416560] rounded-full mr-2 animate-pulse" />
                      EN EJECUCIÓN
                    </span>
                  )}
                  {project.status === 'ACTIVO' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8afd5d]/25 text-[#0c3400] text-xs font-semibold border border-[#39a900]/30">
                      <span className="w-1.5 h-1.5 bg-[#39a900] rounded-full mr-2" />
                      ACTIVO
                    </span>
                  )}
                  {project.status === 'INACTIVO' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dee5d4] text-[#3f4a38] text-xs font-semibold border border-[#becbb3]">
                      <span className="w-1.5 h-1.5 bg-[#6f7b66] rounded-full mr-2" />
                      INACTIVO
                    </span>
                  )}
                  {project.status === 'CANCELADO' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-semibold border border-[#ba1a1a]/30">
                      <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full mr-2" />
                      CANCELADO
                    </span>
                  )}

                  {/* Ver Detalle (Botón Ojo) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-[#39a900] hover:text-white text-[#3f4a38] flex items-center justify-center border border-[#dee5d4] shadow-sm hover:shadow transition-all cursor-pointer group/btn"
                    title="Ver detalle del proyecto"
                  >
                    <span className="material-symbols-outlined text-[19px] transition-transform group-hover/btn:scale-110">
                      visibility
                    </span>
                  </button>
                </div>

                {/* Project Title */}
                <h3 className="font-montserrat text-lg font-bold text-[#171d13] mb-3 line-clamp-2 relative z-10 group-hover:text-[#226d00] transition-colors leading-snug">
                  {project.name}
                </h3>

                {/* Authors & Center */}
                <div className="mt-auto pt-2 space-y-2 relative z-10">
                  <div className="flex items-center gap-2 text-[#3f4a38] text-xs">
                    <span className="material-symbols-outlined text-[18px] shrink-0 text-[#6f7b66]">
                      person
                    </span>
                    <span className="truncate">{getAuthorsNames(project.author_ids)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#3f4a38] text-xs">
                    <span className="material-symbols-outlined text-[18px] shrink-0 text-[#6f7b66]">
                      location_on
                    </span>
                    <span className="truncate">
                      {project.training_center_name || 'CLEM - Centro Latinoamericano de Especies Menores'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-[#dee5d4] relative z-10">
                  <div className="flex justify-between text-xs font-semibold text-[#3f4a38] mb-1.5">
                    <span>Avance</span>
                    <span className="text-[#226d00]">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#dee5d4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3c627f] rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-card rounded-3xl border border-white/60">
          <div className="w-20 h-20 bg-[#eff6e5] rounded-full flex items-center justify-center text-[#3c627f] mb-4 shadow-inner">
            <span className="material-symbols-outlined text-4xl">folder_off</span>
          </div>
          <h3 className="font-montserrat text-xl font-bold text-[#171d13] mb-2">
            No se encontraron proyectos
          </h3>
          <p className="text-sm text-[#3f4a38] max-w-md mx-auto mb-6 leading-relaxed">
            Intenta ajustar los filtros de búsqueda o registra un nuevo proyecto de investigación en el banco institucional.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="bg-[#eff6e5] border border-[#becbb3] text-[#171d13] font-semibold text-xs px-6 py-2.5 rounded-full hover:bg-[#dee5d4] transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={() => setActiveView('new-project')}
              className="btn-liquid text-white font-montserrat font-bold text-xs px-6 py-2.5 rounded-full shadow-md"
            >
              + Registrar Nuevo Proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
