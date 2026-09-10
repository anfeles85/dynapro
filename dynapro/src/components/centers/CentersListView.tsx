import React, { useState, useMemo } from 'react';
import { TrainingCenter, Department, City, TrainingGroup, Project, User, ActiveView } from '../../types';

interface CentersListViewProps {
  centers: TrainingCenter[];
  departments: Department[];
  cities: City[];
  groups: TrainingGroup[];
  projects: Project[];
  currentUser: User | null;
  setActiveView: (view: ActiveView) => void;
  onEditCenter: (center: TrainingCenter) => void;
  onDeleteCenter: (centerId: number) => void;
}

export const CentersListView: React.FC<CentersListViewProps> = ({
  centers,
  departments,
  cities,
  groups,
  projects,
  currentUser,
  setActiveView,
  onEditCenter,
  onDeleteCenter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('ALL');
  const [centerToDelete, setCenterToDelete] = useState<TrainingCenter | null>(null);

  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  // Fast lookups
  const citiesMap = useMemo(() => {
    const map = new Map<number, City>();
    cities.forEach((c) => map.set(c.id, c));
    return map;
  }, [cities]);

  const departmentsMap = useMemo(() => {
    const map = new Map<number, Department>();
    departments.forEach((d) => map.set(d.id, d));
    return map;
  }, [departments]);

  const groupsCountByCenter = useMemo(() => {
    const counts = new Map<number, number>();
    groups.forEach((g) => {
      if (g.training_center_id) {
        counts.set(g.training_center_id, (counts.get(g.training_center_id) || 0) + 1);
      }
    });
    return counts;
  }, [groups]);

  const projectsCountByCenter = useMemo(() => {
    const counts = new Map<number, number>();
    projects.forEach((p) => {
      if (p.training_center_id) {
        counts.set(p.training_center_id, (counts.get(p.training_center_id) || 0) + 1);
      }
    });
    return counts;
  }, [projects]);

  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const city = citiesMap.get(center.city_id);
      const dept = city ? departmentsMap.get(city.department_id) : null;
      const deptName = dept?.name || center.regional_name || center.department_name || '';
      const cityName = city?.name || center.city_name || '';

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = center.name.toLowerCase().includes(query);
        const matchCity = cityName.toLowerCase().includes(query);
        const matchDept = deptName.toLowerCase().includes(query);
        if (!matchName && !matchCity && !matchDept) return false;
      }

      if (selectedDepartmentId !== 'ALL') {
        const targetDeptId = Number(selectedDepartmentId);
        if (!city || city.department_id !== targetDeptId) {
          // Check if regional_name matches department name as fallback
          const deptObj = departmentsMap.get(targetDeptId);
          if (!deptObj || deptObj.name !== deptName) {
            return false;
          }
        }
      }

      return true;
    });
  }, [centers, searchTerm, selectedDepartmentId, citiesMap, departmentsMap]);

  const handleDeleteClick = (center: TrainingCenter) => {
    setCenterToDelete(center);
  };

  const confirmDelete = () => {
    if (centerToDelete) {
      onDeleteCenter(centerToDelete.id);
      setCenterToDelete(null);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            Centros de Formación
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1">
            Administración de centros de formación profesional integral y sedes regionales del SENA.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setActiveView('new-center')}
            className="btn-liquid text-white font-montserrat font-bold text-sm px-6 h-12 rounded-full flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Registrar Nuevo Centro
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="liquid-card rounded-2xl p-6 mb-8 border border-white/60 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f4a38]/70 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre del centro, ciudad o regional..."
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-[#171d13] outline-none h-12"
            />
          </div>

          <div>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer font-medium"
            >
              <option value="ALL">Todas las Regionales / Departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Centers Table */}
      <div className="glass-card rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f0df]/80 border-b border-[#dee5d4] text-[11px] font-bold text-[#6f7b66] uppercase tracking-wider">
                <th className="py-4 px-6">Centro de Formación</th>
                <th className="py-4 px-6">Regional (Departamento)</th>
                <th className="py-4 px-6">Municipio / Ciudad</th>
                <th className="py-4 px-6 text-center">Fichas Vinculadas</th>
                <th className="py-4 px-6 text-center">Proyectos</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee5d4]/60 text-sm">
              {filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6f7b66]">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#3f4a38]/40 block">
                      domain_disabled
                    </span>
                    No se encontraron centros de formación con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCenters.map((center) => {
                  const city = citiesMap.get(center.city_id);
                  const dept = city ? departmentsMap.get(city.department_id) : null;
                  const deptName = dept?.name || center.regional_name || center.department_name || 'No especificada';
                  const cityName = city?.name || center.city_name || 'No especificada';
                  const groupsCount = groupsCountByCenter.get(center.id) || 0;
                  const projectsCount = projectsCountByCenter.get(center.id) || 0;

                  return (
                    <tr key={center.id} className="hover:bg-[#eff6e5]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#8afd5d]/20 text-[#226d00] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">apartment</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#171d13] block">
                              {center.name}
                            </span>
                            <span className="text-[11px] text-[#6f7b66] font-mono">
                              ID #{center.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#3f4a38]">
                        <span className="px-2.5 py-1 rounded-full bg-[#eff6e5] font-medium border border-[#dee5d4]">
                          {deptName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#171d13] font-medium">
                        <div className="flex items-center gap-1.5 text-[#3c627f]">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span>{cityName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            groupsCount > 0
                              ? 'bg-[#b5dcfe]/40 text-[#3b617e] border border-[#b5dcfe]'
                              : 'bg-[#eff6e5] text-[#6f7b66]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">school</span>
                          {groupsCount} {groupsCount === 1 ? 'ficha' : 'fichas'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            projectsCount > 0
                              ? 'bg-[#8afd5d]/20 text-[#0c3400] border border-[#8afd5d]/40'
                              : 'bg-[#eff6e5] text-[#6f7b66]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">science</span>
                          {projectsCount} {projectsCount === 1 ? 'proyecto' : 'proyectos'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEditCenter(center)}
                              className="p-1.5 text-[#3c627f] hover:text-[#171d13] hover:bg-[#dee5d4] rounded-lg transition-colors"
                              title="Editar centro de formación"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(center)}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                              title="Eliminar centro de formación"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#6f7b66]">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {centerToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#dee5d4] space-y-4">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl p-2 bg-[#ffdad6] rounded-xl">
                warning
              </span>
              <div>
                <h3 className="font-montserrat font-bold text-lg text-[#171d13]">
                  Eliminar Centro de Formación
                </h3>
                <p className="text-xs text-[#6f7b66]">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-sm text-[#3f4a38] leading-relaxed">
              ¿Estás seguro de que deseas eliminar el centro{' '}
              <strong className="text-[#171d13] font-semibold">{centerToDelete.name}</strong>?
            </p>

            {((groupsCountByCenter.get(centerToDelete.id) || 0) > 0 ||
              (projectsCountByCenter.get(centerToDelete.id) || 0) > 0) && (
              <div className="p-3 bg-[#fff8e1] border border-[#ffe082] rounded-xl text-xs text-[#8d6e63]">
                <p className="font-bold text-[#f57f17] flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Advertencia de dependencias:
                </p>
                Este centro tiene{' '}
                <strong>{groupsCountByCenter.get(centerToDelete.id) || 0}</strong> fichas y{' '}
                <strong>{projectsCountByCenter.get(centerToDelete.id) || 0}</strong> proyectos
                asociados en el sistema.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCenterToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#3f4a38] hover:bg-[#eff6e5] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] transition-colors shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
