import React, { useState, useMemo, useEffect } from 'react';
import { TrainingCenter, Department, City, ActiveView } from '../../types';

interface CenterFormViewProps {
  initialCenter?: TrainingCenter | null;
  departments: Department[];
  cities: City[];
  onSave: (centerData: Partial<TrainingCenter>) => void;
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const CenterFormView: React.FC<CenterFormViewProps> = ({
  initialCenter,
  departments,
  cities,
  onSave,
  setActiveView,
  onToast
}) => {
  const isEditing = !!initialCenter;

  // Resolve initial department from initialCenter's city_id
  const initialCity = useMemo(() => {
    if (!initialCenter?.city_id) return null;
    return cities.find((c) => c.id === initialCenter.city_id) || null;
  }, [initialCenter, cities]);

  const defaultDeptId = initialCity?.department_id || departments[0]?.id || 1;

  const [name, setName] = useState(initialCenter?.name || '');
  const [selectedDeptId, setSelectedDeptId] = useState<number>(defaultDeptId);
  const [cityId, setCityId] = useState<number>(
    initialCenter?.city_id || cities.find((c) => c.department_id === defaultDeptId)?.id || cities[0]?.id || 1
  );

  // Filter cities by selected department
  const filteredCities = useMemo(() => {
    const list = cities.filter((c) => c.department_id === selectedDeptId);
    return list.length > 0 ? list : cities;
  }, [cities, selectedDeptId]);

  // When selected department changes, keep cityId valid
  useEffect(() => {
    const currentCityBelongs = filteredCities.some((c) => c.id === cityId);
    if (!currentCityBelongs && filteredCities.length > 0) {
      setCityId(filteredCities[0].id);
    }
  }, [selectedDeptId, filteredCities, cityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onToast('error', 'Campo Requerido', 'El nombre del Centro de Formación es obligatorio.');
      return;
    }

    if (!cityId) {
      onToast('error', 'Campo Requerido', 'Debes seleccionar una ciudad o municipio.');
      return;
    }

    const payload: Partial<TrainingCenter> = {
      name: name.trim(),
      city_id: Number(cityId)
    };

    onSave(payload);
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7b66] mb-2">
          <button
            type="button"
            onClick={() => setActiveView('centers')}
            className="hover:text-[#226d00] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Centros de Formación
          </button>
          <span>/</span>
          <span className="text-[#171d13]">{isEditing ? 'Editar Centro' : 'Nuevo Centro'}</span>
        </div>

        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
          {isEditing ? 'Editar Centro de Formación' : 'Registrar Centro de Formación'}
        </h1>
        <p className="text-sm text-[#3f4a38] mt-1">
          Complete los datos institucionales del centro de formación y su ubicación geográfica.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-[#dee5d4] pb-4">
          <span className="material-symbols-outlined text-[#39a900] p-2 bg-[#8afd5d]/20 rounded-xl">
            apartment
          </span>
          <h3 className="font-montserrat text-lg font-bold text-[#171d13]">
            Datos del Centro de Formación
          </h3>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="centerName">
              Nombre del Centro de Formación <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="centerName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Centro Latinoamericano de Especies Menores (CLEM)"
              className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all"
            />
          </div>

          {/* Department & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="deptSelect">
                Regional / Departamento <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="deptSelect"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="citySelect">
                Municipio / Ciudad <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="citySelect"
                value={cityId}
                onChange={(e) => setCityId(Number(e.target.value))}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] outline-none transition-all cursor-pointer font-semibold"
              >
                {filteredCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#dee5d4]">
          <button
            type="button"
            onClick={() => setActiveView('centers')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#3f4a38] hover:bg-[#eff6e5] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-liquid text-white font-montserrat font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isEditing ? 'Guardar Cambios' : 'Registrar Centro'}
          </button>
        </div>
      </form>
    </div>
  );
};
