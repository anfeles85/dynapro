import React, { useState } from 'react';
import { TrainingGroup, TrainingCenter, ActiveView, GroupSchedule } from '../../types';

interface GroupFormViewProps {
  initialGroup?: TrainingGroup | null;
  centers: TrainingCenter[];
  onSave: (groupData: Partial<TrainingGroup>) => void;
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

const normalizeSchedule = (val?: string): GroupSchedule => {
  if (!val) return 'DIURNA';
  const upper = val.toUpperCase();
  if (upper === 'MIXTA') return 'MIXTA';
  if (upper === 'NOCTURNA') return 'NOCTURNA';
  return 'DIURNA';
};

export const GroupFormView: React.FC<GroupFormViewProps> = ({
  initialGroup,
  centers,
  onSave,
  setActiveView,
  onToast
}) => {
  const isEditing = !!initialGroup;

  const [number, setNumber] = useState(initialGroup?.number || '');
  const [program, setProgram] = useState(initialGroup?.training_program || '');
  const [schedule, setSchedule] = useState<GroupSchedule>(
    normalizeSchedule(initialGroup?.schedule)
  );
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>(initialGroup?.status || 'Activo');
  const [trainingCenterId, setTrainingCenterId] = useState<number>(
    initialGroup?.training_center_id ?? (centers[0]?.id ?? 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!number.trim()) {
      onToast('error', 'Campo Requerido', 'El número de ficha es obligatorio.');
      return;
    }

    if (!program.trim()) {
      onToast('error', 'Campo Requerido', 'El nombre del programa de formación es obligatorio.');
      return;
    }

    if (!trainingCenterId) {
      onToast('error', 'Campo Requerido', 'Debes seleccionar un Centro de Formación.');
      return;
    }

    const payload: Partial<TrainingGroup> = {
      number: number.trim(),
      training_program: program.trim(),
      schedule,
      status,
      training_center_id: trainingCenterId
    };

    onSave(payload);
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7b66] mb-2">
          <button
            onClick={() => setActiveView('groups')}
            className="hover:text-[#226d00] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Grupos de Formación
          </button>
          <span>/</span>
          <span className="text-[#171d13]">{isEditing ? 'Editar Ficha' : 'Nueva Ficha'}</span>
        </div>

        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
          {isEditing ? 'Editar Grupo de Formación' : 'Registrar Grupo de Formación'}
        </h1>
        <p className="text-sm text-[#3f4a38] mt-1">
          Ingrese el código de ficha SOFIA Plus y los datos del programa académico correspondiente al CLEM.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-[#dee5d4] pb-4">
          <span className="material-symbols-outlined text-[#39a900] p-2 bg-[#8afd5d]/20 rounded-xl">
            school
          </span>
          <h3 className="font-montserrat text-lg font-bold text-[#171d13]">
            Datos de la Ficha
          </h3>
        </div>

        <div className="space-y-5">
          {/* Number */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="number">
              Número de Ficha (SOFIA Plus) <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="number"
              type="text"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ej. 2694120"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all font-mono"
            />
          </div>

          {/* Program Name */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="program">
              Programa de Formación <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="program"
              type="text"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="Ej. Tecnología en Acuicultura y Producción de Especies Menores"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all"
            />
          </div>

          {/* Schedule & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="schedule">
                Jornada de Formación <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as GroupSchedule)}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="DIURNA">DIURNA</option>
                <option value="MIXTA">MIXTA</option>
                <option value="NOCTURNA">NOCTURNA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="status">
                Estado <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Training Center */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="training_center">
              Centro de Formación Asociado <span className="text-[#ba1a1a]">*</span>
            </label>
            {centers.length > 0 ? (
              <select
                id="training_center"
                value={trainingCenterId}
                onChange={(e) => setTrainingCenterId(Number(e.target.value))}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer"
              >
                <option value={0} disabled>Seleccione un Centro de Formación...</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} - ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-[#e9f0df] rounded-xl text-xs font-medium text-[#6f7b66] border border-[#dee5d4] animate-pulse">
                Cargando centros de formación...
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#dee5d4]">
          <button
            type="button"
            onClick={() => setActiveView('groups')}
            className="px-6 py-3 rounded-xl font-montserrat text-sm font-bold text-[#171d13] hover:bg-[#dee5d4] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-liquid text-white font-montserrat font-bold text-sm px-8 py-3 rounded-xl shadow-md cursor-pointer"
          >
            {isEditing ? 'Guardar Cambios' : 'Registrar Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
};
