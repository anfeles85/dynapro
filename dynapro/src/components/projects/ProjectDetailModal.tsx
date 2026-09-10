import React from 'react';
import { Project, User, TrainingGroup, TrainingCenter } from '../../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  currentUser: User | null;
  allUsers: User[];
  allGroups: TrainingGroup[];
  allCenters: TrainingCenter[];
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  currentUser,
  allUsers,
  allGroups,
  allCenters
}) => {
  if (!project) return null;

  const isAdmin = currentUser?.role === 'ADMINISTRADOR';
  const isAuthor = currentUser ? project.author_ids.includes(currentUser.id) : false;
  const canModify = isAdmin || isAuthor;

  const authors = allUsers.filter((u) => project.author_ids.includes(u.id));
  const groups = allGroups.filter((g) => project.training_group_ids.includes(g.id));
  const center = allCenters.find((c) => c.id === project.training_center_id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'EN EJECUCIÓN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#769b95]/20 text-[#0b322e] text-xs font-semibold border border-[#769b95]/30">
            <span className="w-2 h-2 bg-[#416560] rounded-full mr-2 animate-pulse" />
            EN EJECUCIÓN
          </span>
        );
      case 'ACTIVO':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8afd5d]/20 text-[#0c3400] text-xs font-semibold border border-[#39a900]/30">
            <span className="w-2 h-2 bg-[#39a900] rounded-full mr-2" />
            ACTIVO
          </span>
        );
      case 'INACTIVO':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dee5d4] text-[#3f4a38] text-xs font-semibold border border-[#becbb3]">
            <span className="w-2 h-2 bg-[#6f7b66] rounded-full mr-2" />
            INACTIVO
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-semibold border border-[#ba1a1a]/30">
            <span className="w-2 h-2 bg-[#ba1a1a] rounded-full mr-2" />
            CANCELADO
          </span>
        );
    }
  };

  const handleDownloadAttachment = async (att: Project['attachments'][0]) => {
    if (!att.file_url) return;

    // Si es un data URL base64 o blob
    if (att.file_url.startsWith('data:') || att.file_url.startsWith('blob:')) {
      const element = document.createElement('a');
      element.setAttribute('href', att.file_url);
      element.setAttribute('download', att.name);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    // Si es una URL pública (Supabase Storage)
    try {
      const response = await fetch(att.file_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback a enlace directo
      window.open(att.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAttachmentIcon = (mimeOrName: string) => {
    const lower = mimeOrName.toLowerCase();
    if (lower.includes('pdf')) return { icon: 'picture_as_pdf', color: 'text-[#ba1a1a]' };
    if (lower.includes('sheet') || lower.includes('excel') || lower.includes('xls'))
      return { icon: 'table_chart', color: 'text-[#226d00]' };
    if (lower.includes('word') || lower.includes('doc'))
      return { icon: 'description', color: 'text-[#3c627f]' };
    if (lower.includes('image') || lower.includes('png') || lower.includes('jpg'))
      return { icon: 'image', color: 'text-[#e29300]' };
    if (lower.includes('zip') || lower.includes('rar') || lower.includes('compressed'))
      return { icon: 'folder_zip', color: 'text-[#6f7b66]' };
    return { icon: 'draft', color: 'text-[#39a900]' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/60 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-[#dee5d4] flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(project.status)}
              <span className="text-xs text-[#6f7b66] font-mono">ID #{project.id}</span>
            </div>
            <h2 className="font-montserrat text-xl sm:text-2xl font-bold text-[#171d13] leading-snug">
              {project.name}
            </h2>
            {project.short_name && (
              <p className="text-xs font-semibold text-[#3c627f] mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">label</span>
                {project.short_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6f7b66] hover:text-[#171d13] hover:bg-[#eff6e5] rounded-full transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Progress Banner */}
          <div className="p-4 rounded-2xl bg-[#eff6e5] border border-[#dee5d4]">
            <div className="flex justify-between text-xs font-semibold text-[#171d13] mb-2">
              <span>Porcentaje de Avance General</span>
              <span className="text-[#226d00] text-sm">{project.progress}%</span>
            </div>
            <div className="h-3 w-full bg-[#dee5d4] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#39a900] to-[#3c627f] rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Keywords */}
          {project.keywords && project.keywords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider mb-2">
                Palabras Clave
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#b5dcfe]/40 text-[#3b617e] border border-[#b5dcfe]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Executive Summary / Abstract */}
          <div>
            <h4 className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider mb-2">
              Resumen Ejecutivo (Abstract)
            </h4>
            <p className="text-sm text-[#171d13] bg-[#f7f9fb] p-4 rounded-xl border border-[#dee5d4] leading-relaxed">
              {project.executive_summary}
            </p>
          </div>

          {/* Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#eff6e5]/70 border border-[#dee5d4]">
              <h4 className="text-xs font-bold text-[#226d00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">flag</span>
                Objetivo General
              </h4>
              <p className="text-xs text-[#171d13] leading-relaxed">{project.general_objective}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#eff6e5]/70 border border-[#dee5d4]">
              <h4 className="text-xs font-bold text-[#3c627f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">checklist</span>
                Objetivos Específicos
              </h4>
              {project.specific_objectives && project.specific_objectives.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-[#171d13] list-disc list-inside">
                  {project.specific_objectives.map((obj, i) => (
                    <li key={i} className="leading-relaxed">
                      {obj}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6f7b66]">No se registraron objetivos específicos.</p>
              )}
            </div>
          </div>

          {/* Beneficiaries */}
          {project.beneficiaries && (
            <div className="p-4 rounded-xl bg-[#eff6e5]/70 border border-[#dee5d4]">
              <h4 className="text-xs font-bold text-[#3f4a38] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">groups</span>
                Beneficiarios
              </h4>
              <p className="text-xs text-[#171d13] leading-relaxed">{project.beneficiaries}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-[#dee5d4] shadow-sm">
              <span className="text-[11px] font-semibold text-[#6f7b66] uppercase block">
                Presupuesto Total
              </span>
              <span className="text-base font-bold text-[#226d00]">
                {formatCurrency(project.total_budget)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#dee5d4] shadow-sm">
              <span className="text-[11px] font-semibold text-[#6f7b66] uppercase block">
                Fecha Inicio &bull; Fin
              </span>
              <span className="text-xs font-medium text-[#171d13]">
                {project.start_date} al {project.end_date}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#dee5d4] shadow-sm">
              <span className="text-[11px] font-semibold text-[#6f7b66] uppercase block">
                Centro &bull; Regional
              </span>
              <span className="text-xs font-medium text-[#171d13] truncate block">
                {center?.name || project.training_center_name || 'CLEM'}
              </span>
            </div>
          </div>

          {/* Authors & Coauthors */}
          <div>
            <h4 className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider mb-2.5">
              Equipo de Investigación (Autores)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authors.map((author, index) => (
                <div
                  key={author.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#dee5d4] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-[#8afd5d]/30 text-[#0c3400] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {author.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#171d13] truncate">{author.full_name}</p>
                    <p className="text-[11px] text-[#6f7b66]">{author.role}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff6e5] text-[#226d00]">
                    {index === 0 ? 'IP (Principal)' : 'Coautor'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Training Groups */}
          {groups.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider mb-2">
                Grupos de Formación Vinculados
              </h4>
              <div className="flex flex-wrap gap-2">
                {groups.map((grp) => (
                  <div
                    key={grp.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e9f0df] text-xs font-medium text-[#171d13] border border-[#dee5d4]"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#39a900]">school</span>
                    <span>Ficha {grp.number} &mdash; {grp.training_program} ({grp.schedule})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div>
            <h4 className="text-xs font-bold text-[#6f7b66] uppercase tracking-wider mb-2.5">
              Anexos y Documentación ({project.attachments.length})
            </h4>
            {project.attachments && project.attachments.length > 0 ? (
              <div className="space-y-2">
                {project.attachments.map((att) => {
                  const iconInfo = getAttachmentIcon(att.mime_type || att.name);
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#f7f9fb] border border-[#dee5d4] hover:bg-[#eff6e5] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <span className={`material-symbols-outlined ${iconInfo.color} text-[24px] shrink-0`}>
                          {iconInfo.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#171d13] truncate">{att.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6f7b66]">
                            <span>{att.size}</span>
                            <span>&bull;</span>
                            <span>Subido el {att.uploaded_at}</span>
                            {att.storage_path && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#226d00] bg-[#39a900]/10 px-1.5 py-0.2 rounded border border-[#39a900]/20">
                                <span className="material-symbols-outlined text-[12px]">cloud_done</span>
                                Supabase Storage
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#dee5d4] border border-[#becbb3] text-xs font-semibold text-[#171d13] flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Descargar
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#6f7b66] italic">No hay documentos anexos adjuntos a este proyecto.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md p-5 px-6 border-t border-[#dee5d4] flex justify-between items-center z-10">
          <div>
            {!canModify && (
              <span className="text-xs text-[#6f7b66] italic">
                * Solo los autores o Administradores pueden editar este proyecto (RBAC).
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {canModify && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(project.id);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-semibold transition-colors"
                >
                  Eliminar Lógicamente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(project);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#39a900] text-white hover:bg-[#226d00] text-xs font-bold font-montserrat transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Editar Proyecto
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#eff6e5] text-[#171d13] hover:bg-[#dee5d4] text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
