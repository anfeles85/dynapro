import React, { useState, useEffect } from 'react';
import {
  Project,
  User,
  ActiveView,
  TrainingGroup,
  TrainingCenter,
  Department,
  City,
  Attachment
} from '../../types';
import { checkDuplicateTitle, validateAttachmentFile, formatBytes } from '../../services/storage';

interface NewProjectViewProps {
  initialProject?: Project | null;
  currentUser: User | null;
  allUsers: User[];
  allGroups: TrainingGroup[];
  allCenters: TrainingCenter[];
  allDepartments: Department[];
  allCities: City[];
  onSave: (projectData: Partial<Project>) => Promise<void> | void;
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  initialProject,
  currentUser,
  allUsers,
  allGroups,
  allCenters,
  allDepartments,
  allCities,
  onSave,
  setActiveView,
  onToast
}) => {
  const isEditing = !!initialProject;

  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialProject?.name || '');
  const [shortName, setShortName] = useState(initialProject?.short_name || '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [summary, setSummary] = useState(initialProject?.executive_summary || '');
  const [objGeneral, setObjGeneral] = useState(initialProject?.general_objective || '');
  const [objSpecific, setObjSpecific] = useState(
    initialProject?.specific_objectives ? initialProject.specific_objectives.join('\n') : ''
  );
  const [keywords, setKeywords] = useState<string[]>(
    initialProject?.keywords || ['Aprendiz']
  );
  const [beneficiaries, setBeneficiaries] = useState(
    initialProject?.beneficiaries || ''
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [budget, setBudget] = useState<number>(initialProject?.total_budget || 35000000);
  const [startDate, setStartDate] = useState(
    initialProject?.start_date || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialProject?.end_date ||
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<Project['status']>(
    initialProject?.status || 'EN EJECUCIÓN'
  );
  const [progress, setProgress] = useState<number>(initialProject?.progress || 10);

  // Section 2: Authorship & Centers
  const [selectedCenterId, setSelectedCenterId] = useState<number>(
    initialProject?.training_center_id || 1
  );
  const [authorIds, setAuthorIds] = useState<number[]>(
    initialProject?.author_ids || (currentUser ? [currentUser.id] : [1])
  );
  const [authorSearch, setAuthorSearch] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(
    initialProject?.training_group_ids || [1]
  );

  // Section 3: Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialProject?.attachments || []
  );
  const [isDragActive, setIsDragActive] = useState(false);

  // Real-time title duplicate validation (PRD TC-03)
  useEffect(() => {
    if (title.trim().length > 4) {
      const isDuplicate = checkDuplicateTitle(title, initialProject?.id);
      if (isDuplicate) {
        setTitleError('Ya existe un proyecto registrado con este título o un nombre muy similar.');
      } else {
        setTitleError(null);
      }
    } else {
      setTitleError(null);
    }
  }, [title, initialProject]);

  // Keyword tags handling
  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = keywordInput.trim().replace(/^#/, '');
    if (clean && !keywords.includes(clean)) {
      setKeywords([...keywords, clean]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  // Author adding
  const handleAddAuthor = (userId: number) => {
    if (!authorIds.includes(userId)) {
      setAuthorIds([...authorIds, userId]);
      setAuthorSearch('');
      onToast('info', 'Coautor Vinculado', 'Se añadió el autor al equipo de investigación.');
    }
  };

  const handleRemoveAuthor = (userId: number) => {
    if (authorIds.length === 1) {
      onToast('warning', 'Autor Obligatorio', 'El proyecto debe tener al menos un autor principal.');
      return;
    }
    setAuthorIds(authorIds.filter((id) => id !== userId));
  };

  // File Upload handling with strict validation
  const processUploadedFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateAttachmentFile(file);
      if (!validation.valid) {
        onToast('error', 'Archivo Rechazado', validation.error || 'Archivo inválido.');
        return;
      }

      // Convert to base64 or blob URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          file_url: fileUrl,
          size: formatBytes(file.size),
          size_bytes: file.size,
          mime_type: file.type || 'application/octet-stream',
          uploaded_at: new Date().toISOString().split('T')[0]
        };

        setAttachments((prev) => [...prev, newAtt]);
        onToast('success', 'Archivo Adjuntado', `Se cargó "${file.name}" (${formatBytes(file.size)}).`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    processUploadedFiles(e.dataTransfer.files);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attId));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    // Validation
    if (!title.trim()) {
      setTitleError('El título del proyecto es obligatorio.');
      onToast('error', 'Campo Requerido', 'Por favor ingrese el título del proyecto.');
      return;
    }

    if (checkDuplicateTitle(title, initialProject?.id)) {
      setTitleError('Título duplicado. Cambie el nombre del proyecto antes de guardar.');
      onToast('error', 'Control de Duplicidad', 'No se puede guardar un proyecto con un título ya existente.');
      return;
    }

    if (!summary.trim()) {
      onToast('error', 'Campo Requerido', 'El resumen (abstract) es obligatorio.');
      return;
    }

    if (!objGeneral.trim()) {
      onToast('error', 'Campo Requerido', 'El objetivo general es obligatorio.');
      return;
    }

    const specificObjsArray = objSpecific
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const centerObj = allCenters.find((c) => c.id === selectedCenterId);

    const payload: Partial<Project> = {
      name: title.trim(),
      short_name: shortName.trim(),
      training_center_id: selectedCenterId,
      training_center_name: centerObj?.name || 'CLEM - Centro Latinoamericano de Especies Menores',
      regional_name: centerObj?.department_name || initialProject?.regional_name || 'Valle del Cauca',
      beneficiaries:
        beneficiaries.trim() ||
        `Instructores y aprendices del ${centerObj?.name || 'CLEM'}`,
      executive_summary: summary.trim(),
      keywords: keywords.length > 0 ? keywords : ['Aprendiz'],
      general_objective: objGeneral.trim(),
      specific_objectives: specificObjsArray,
      start_date: startDate,
      end_date: endDate,
      total_budget: Number(budget) || 0,
      status,
      progress: Number(progress) || 0,
      author_ids: authorIds,
      training_group_ids: selectedGroupIds,
      attachments,
      created_by_user_id: currentUser?.id || 1
    };

    setIsSaving(true);
    try {
      await onSave(payload);
    } catch (err: any) {
      console.error('Error al guardar proyecto:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSearchUsers = allUsers.filter((u) => {
    if (authorIds.includes(u.id)) return false;
    if (!authorSearch.trim()) return false;
    const query = authorSearch.toLowerCase();
    return u.full_name.toLowerCase().includes(query) || u.document.includes(query);
  });

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full relative">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7b66] mb-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setActiveView('projects')}
            className={`transition-colors flex items-center gap-1 ${isSaving ? 'opacity-50 cursor-not-allowed text-[#6f7b66]' : 'hover:text-[#226d00] cursor-pointer'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Banco de Proyectos
          </button>
          <span>/</span>
          <span className="text-[#171d13]">{isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</span>
        </div>

        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
          {isEditing ? 'Editar Proyecto de Investigación' : 'Nuevo Proyecto de Investigación'}
        </h1>
        <p className="text-sm text-[#3f4a38] mt-1">
          Complete los siguientes campos para registrar o actualizar el proyecto en el sistema institucional.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 pb-28">
        {/* Section 1: Basic Data */}
        <section className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6 border-b border-[#dee5d4] pb-4">
            <span className="material-symbols-outlined text-[#39a900] p-2 bg-[#8afd5d]/20 rounded-xl">
              description
            </span>
            <h3 className="font-montserrat text-lg font-bold text-[#171d13]">1. Datos Básicos</h3>
          </div>

          <div className="space-y-6">
            {/* Title with Duplicate Detection */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#3f4a38]" htmlFor="title">
                  Título del Proyecto <span className="text-[#ba1a1a]">*</span>
                </label>
                {title.trim().length > 4 && !titleError && (
                  <span className="text-[11px] text-[#226d00] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Título disponible y válido
                  </span>
                )}
              </div>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Evaluación de sistemas acuapónicos en climas templados"
                className={`w-full bg-[#eff6e5] border rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white transition-all outline-none ${titleError
                    ? 'border-[#ba1a1a] bg-[#ffdad6]/20 ring-1 ring-[#ba1a1a]'
                    : 'border-transparent focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10'
                  }`}
              />
              {titleError && (
                <p className="text-xs text-[#ba1a1a] mt-1.5 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {titleError}
                </p>
              )}
            </div>

            {/* Nombre corto */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="shortName">
                Nombre corto
              </label>
              <input
                id="shortName"
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Ej. Acuaponía Templada o Sigla del proyecto"
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10 transition-all outline-none"
              />
            </div>

            {/* Resumen / Abstract */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="summary">
                Resumen (Abstract) <span className="text-[#ba1a1a]">*</span>
              </label>
              <textarea
                id="summary"
                required
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Breve descripción del problema, objetivos, metodología y resultados esperados..."
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10 transition-all outline-none resize-none"
              />
            </div>

            {/* General & Specific Objectives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="objGeneral">
                  Objetivo General <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  id="objGeneral"
                  required
                  rows={3}
                  value={objGeneral}
                  onChange={(e) => setObjGeneral(e.target.value)}
                  placeholder="Defina el propósito fundamental de la investigación..."
                  className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="objSpecific">
                  Objetivos Específicos
                </label>
                <textarea
                  id="objSpecific"
                  rows={3}
                  value={objSpecific}
                  onChange={(e) => setObjSpecific(e.target.value)}
                  placeholder="Un objetivo por línea..."
                  className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10 transition-all outline-none resize-none"
                />
              </div>
            </div>

            {/* Beneficiarios */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="beneficiaries">
                Beneficiarios
              </label>
              <textarea
                id="beneficiaries"
                rows={2}
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
                placeholder="Ej. Instructores, aprendices del CLEM y comunidades campesinas de la región..."
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] focus:ring-2 focus:ring-[#3c627f]/10 transition-all outline-none resize-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5">
                Palabras Clave
              </label>
              <div className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-2 px-3 focus-within:bg-white focus-within:border-[#3c627f] focus-within:ring-2 focus-within:ring-[#3c627f]/10 transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-[#b5dcfe] text-[#3b617e] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-[#ba1a1a] transition-colors"
                      aria-label={`Eliminar palabra clave ${kw}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Añadir palabra y presionar Enter..."
                  className="flex-1 bg-transparent border-none p-1 focus:ring-0 text-sm min-w-[150px] outline-none"
                />
              </div>
            </div>

            {/* Dates, Budget, Status & Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#eff6e5] rounded-xl py-2.5 px-3 text-sm text-[#171d13] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#eff6e5] rounded-xl py-2.5 px-3 text-sm text-[#171d13] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5">
                  Presupuesto (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-[#eff6e5] rounded-xl py-2.5 px-3 text-sm text-[#171d13] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5">
                  Estado &bull; Avance ({progress}%)
                </label>
                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    className="w-full bg-[#eff6e5] rounded-xl py-2 px-2 text-xs font-semibold text-[#171d13] outline-none"
                  >
                    <option value="EN EJECUCIÓN">EN EJECUCIÓN</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 bg-[#eff6e5] rounded-xl py-2 px-2 text-xs font-bold text-center outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Authorship & Training Center */}
        <section className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6 border-b border-[#dee5d4] pb-4">
            <span className="material-symbols-outlined text-[#3c627f] p-2 bg-[#b5dcfe]/50 rounded-xl">
              group_add
            </span>
            <h3 className="font-montserrat text-lg font-bold text-[#171d13]">
              2. Autoría y Centro de Formación
            </h3>
          </div>

          <div className="space-y-6">
            {/* Centro de Formación */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="centro">
                Centro de Formación <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="centro"
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(Number(e.target.value))}
                className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 px-4 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] transition-all outline-none cursor-pointer"
              >
                {allCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Investigadores (Autores) List */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-2">
                Investigadores (Autores y Coautores)
              </label>

              {/* Current Authors Chips */}
              <div className="space-y-2 mb-4">
                {authorIds.map((authId, index) => {
                  const author = allUsers.find((u) => u.id === authId);
                  if (!author) return null;
                  const isCurrent = currentUser?.id === author.id;

                  return (
                    <div
                      key={authId}
                      className="flex items-center justify-between bg-[#eff6e5] p-3 rounded-xl border border-[#dee5d4] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8afd5d] text-[#0c3400] flex items-center justify-center font-bold text-xs">
                          {author.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#171d13]">
                            {author.full_name} {isCurrent ? '(Tú)' : ''}
                          </p>
                          <p className="text-xs text-[#3f4a38]">
                            {index === 0 ? 'Investigador Principal' : 'Coautor'} &bull; {author.role} ({author.document})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-[#769b95]/20 text-[#416560] px-2.5 py-1 rounded-lg text-xs font-bold">
                          {index === 0 ? 'IP' : 'CO'}
                        </span>
                        {authorIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(author.id)}
                            className="text-[#6f7b66] hover:text-[#ba1a1a] p-1 transition-colors"
                            title="Quitar autor"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Search and Add Author */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f4a38]/70 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  placeholder="Buscar por nombre o número de documento para vincular coautor..."
                  className="w-full bg-[#eff6e5] border border-transparent rounded-xl py-3 pl-11 pr-24 text-sm text-[#171d13] focus:bg-white focus:border-[#3c627f] transition-all outline-none"
                />

                {filteredSearchUsers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-[#dee5d4] p-2 z-20 max-h-48 overflow-y-auto">
                    {filteredSearchUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleAddAuthor(user.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#eff6e5] text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#dee5d4] flex items-center justify-center font-bold text-xs text-[#226d00]">
                            {user.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171d13]">{user.full_name}</p>
                            <p className="text-[11px] text-[#6f7b66]">
                              Doc: {user.document} &bull; {user.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-[#39a900] font-bold">+ Vincular</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Training Groups Link */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-2">
                Grupos de Formación Asociados
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allGroups.map((grp) => {
                  const isSelected = selectedGroupIds.includes(grp.id);
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedGroupIds(selectedGroupIds.filter((id) => id !== grp.id));
                        } else {
                          setSelectedGroupIds([...selectedGroupIds, grp.id]);
                        }
                      }}
                      className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all ${isSelected
                          ? 'bg-[#8afd5d]/20 border-[#39a900] text-[#0c3400] font-semibold'
                          : 'bg-[#eff6e5] border-transparent text-[#3f4a38] hover:bg-[#dee5d4]'
                        }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs truncate font-bold">Ficha {grp.number}</p>
                        <p className="text-[11px] text-[#6f7b66] truncate">{grp.training_program} ({grp.schedule})</p>
                      </div>
                      <span className="material-symbols-outlined text-[20px]">
                        {isSelected ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Attachments */}
        <section className="glass-card rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-4 border-b border-[#dee5d4] pb-4">
            <span className="material-symbols-outlined text-[#416560] p-2 bg-[#c3eae4]/40 rounded-xl">
              upload_file
            </span>
            <h3 className="font-montserrat text-lg font-bold text-[#171d13]">3. Anexos</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-[#3f4a38]">
              Adjunte los documentos requeridos para la formulación del proyecto (formato de propuesta, cronograma, presupuesto, etc.).
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('projectFileInput')?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[190px] ${isDragActive
                  ? 'border-[#39a900] bg-[#39a900]/10 scale-[1.01]'
                  : 'border-[#becbb3] bg-white/50 hover:bg-[#eff6e5]/80'
                }`}
            >
              <input
                id="projectFileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) => processUploadedFiles(e.target.files)}
              />
              <span className="material-symbols-outlined text-4xl text-[#39a900] mb-2">
                cloud_upload
              </span>
              <h4 className="font-semibold text-sm text-[#171d13] mb-0.5">
                Arrastre y suelte sus archivos aquí
              </h4>
              <p className="text-xs text-[#6f7b66] mb-3">o haga clic para examinar desde su equipo</p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#3f4a38] bg-[#e9f0df] px-3 py-1.5 rounded-lg border border-[#dee5d4]">
                <span>
                  <strong>Formatos:</strong> PDF, DOCX, XLSX
                </span>
                <span>|</span>
                <span>
                  <strong>Máximo:</strong> 20 MB por archivo
                </span>
              </div>
            </div>

            {/* Uploaded Files List */}
            {attachments.length > 0 && (
              <ul className="space-y-2 mt-4">
                {attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between p-3.5 bg-[#eff6e5] rounded-xl border border-[#dee5d4] shadow-sm animate-in fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-[24px] shrink-0">
                        picture_as_pdf
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-[#171d13] truncate">{att.name}</p>
                        <p className="text-[11px] text-[#6f7b66]">
                          {att.size} &bull; Subido el {att.uploaded_at}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-[#6f7b66] hover:text-[#ba1a1a] p-1 rounded-lg transition-colors shrink-0"
                      title="Eliminar archivo"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Sticky Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#f5fceb]/95 backdrop-blur-md border-t border-white/40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] p-4 px-6 md:px-12 flex items-center justify-between gap-4 z-30">
          <div className="flex items-center">
            {isSaving ? (
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#226d00] bg-[#39a900]/10 px-3.5 py-2 rounded-xl border border-[#39a900]/25 shadow-xs">
                <span className="w-4 h-4 border-2 border-[#226d00]/30 border-t-[#226d00] rounded-full animate-spin shrink-0" />
                <span className="truncate">
                  {attachments.length > 0
                    ? `Guardando proyecto y subiendo ${attachments.length} ${attachments.length === 1 ? 'anexo' : 'anexos'} a la base de datos...`
                    : 'Guardando registro en la base de datos...'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#6f7b66] hidden sm:inline">
                * Los campos marcados son obligatorios para el registro oficial.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setActiveView('projects')}
              className={`px-6 py-3 rounded-xl font-montserrat text-sm font-bold text-[#171d13] hover:bg-[#e4ebda] transition-colors min-h-[52px] ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-montserrat text-sm font-bold text-white btn-liquid transition-all min-h-[52px] shadow-lg flex items-center gap-2.5 ${isSaving ? 'opacity-80 cursor-wait shadow-none' : 'active:scale-98 cursor-pointer'
                }`}
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                  <span>
                    {attachments.length > 0
                      ? isEditing
                        ? 'Guardando cambios...'
                        : 'Guardando y subiendo anexos...'
                      : isEditing
                        ? 'Guardando cambios...'
                        : 'Guardando proyecto...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>{isEditing ? 'Guardar Cambios' : 'Guardar Proyecto'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
