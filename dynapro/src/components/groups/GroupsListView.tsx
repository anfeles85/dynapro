import React, { useState, useMemo } from 'react';
import { TrainingGroup, TrainingCenter, User, ActiveView } from '../../types';

interface GroupsListViewProps {
  groups: TrainingGroup[];
  centers: TrainingCenter[];
  currentUser: User | null;
  setActiveView: (view: ActiveView) => void;
  onEditGroup: (group: TrainingGroup) => void;
  onDeleteGroup: (groupId: number) => void;
  onToggleStatus: (groupId: number) => void;
}

export const GroupsListView: React.FC<GroupsListViewProps> = ({
  groups,
  centers,
  currentUser,
  setActiveView,
  onEditGroup,
  onDeleteGroup,
  onToggleStatus
}) => {
  const centersMap = useMemo(() => {
    const map = new Map<number, TrainingCenter>();
    centers.forEach((c) => map.set(c.id, c));
    return map;
  }, [centers]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('ALL');

  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNum = g.number.toLowerCase().includes(query);
        const matchProg = g.training_program.toLowerCase().includes(query);
        if (!matchNum && !matchProg) return false;
      }

      if (selectedSchedule !== 'ALL') {
        const groupSched = (g.schedule || '').toUpperCase();
        if (groupSched !== selectedSchedule) return false;
      }

      return true;
    });
  }, [groups, searchTerm, selectedSchedule]);

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            Grupos de Formación (Fichas)
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1">
            Administración de fichas y programas de formación técnica y tecnológica del CLEM.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setActiveView('new-group')}
            className="btn-liquid text-white font-montserrat font-bold text-sm px-6 h-12 rounded-full flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Registrar Nuevo Grupo
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
              placeholder="Buscar por número de ficha o nombre del programa..."
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-[#171d13] outline-none h-12"
            />
          </div>

          <div>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer font-medium"
            >
              <option value="ALL">Todas las Jornadas</option>
              <option value="DIURNA">DIURNA</option>
              <option value="MIXTA">MIXTA</option>
              <option value="NOCTURNA">NOCTURNA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="glass-card rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f0df]/80 border-b border-[#dee5d4] text-[11px] font-bold text-[#6f7b66] uppercase tracking-wider">
                <th className="py-4 px-6">Número de Ficha</th>
                <th className="py-4 px-6">Programa de Formación</th>
                <th className="py-4 px-6">Jornada</th>
                <th className="py-4 px-6">Centro de Formación</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee5d4]/60 text-sm">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-[#eff6e5]/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#226d00]">
                    {group.number}
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#171d13]">
                    {group.training_program}
                  </td>
                  <td className="py-4 px-6 text-xs text-[#3f4a38]">
                    <span className="px-2.5 py-1 rounded-full bg-[#eff6e5] font-medium border border-[#dee5d4]">
                      {group.schedule}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-[#6f7b66]">
                    {(() => {
                      const center = group.training_center_id ? centersMap.get(group.training_center_id) : null;
                      if (!center) return <span className="text-[#3f4a38]/40 italic">Sin centro asignado</span>;
                      return center.name;
                    })()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${group.status === 'Activo'
                        ? 'bg-[#8afd5d]/20 text-[#0c3400]'
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${group.status === 'Activo' ? 'bg-[#39a900]' : 'bg-[#ba1a1a]'
                          }`}
                      />
                      {group.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditGroup(group)}
                          className="p-1.5 text-[#3c627f] hover:text-[#171d13] hover:bg-[#dee5d4] rounded-lg transition-colors"
                          title="Editar grupo"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => onToggleStatus(group.id)}
                          className="p-1.5 text-[#6f7b66] hover:text-[#226d00] hover:bg-[#eff6e5] rounded-lg transition-colors"
                          title={group.status === 'Activo' ? 'Inactivar ficha' : 'Activar ficha'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {group.status === 'Activo' ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                        <button
                          onClick={() => onDeleteGroup(group.id)}
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                          title="Eliminar grupo"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#6f7b66]">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
