import React, { useState, useMemo } from 'react';
import { ActivityLog, ActiveView } from '../../types';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  setActiveView: (view: ActiveView) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  setActiveView,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectedLog, setInspectedLog] = useState<ActivityLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchUser = log.user_name.toLowerCase().includes(query);
        const matchLabel = log.action_label.toLowerCase().includes(query);
        const matchDetail = log.detail.toLowerCase().includes(query);
        if (!matchUser && !matchLabel && !matchDetail) return false;
      }

      if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      if (selectedAction !== 'ALL' && log.action_type !== selectedAction) {
        return false;
      }

      return true;
    });
  }, [logs, searchTerm, selectedModule, selectedAction]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      onToast('warning', 'Sin Registros', 'No hay registros para exportar con los filtros actuales.');
      return;
    }

    const headers = ['ID', 'Fecha/Hora', 'Usuario', 'Módulo', 'Tipo Acción', 'Acción', 'Detalle'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user_name}"`,
      `"${l.module}"`,
      `"${l.action_type}"`,
      `"${l.action_label}"`,
      `"${l.detail.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dynapro_auditoria_clem_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('success', 'Auditoría Exportada', `Se descargó el log de auditoría (${filteredLogs.length} registros).`);
  };

  const getActionBadge = (type: ActivityLog['action_type']) => {
    switch (type) {
      case 'CREAR':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8afd5d]/30 text-[#0c3400]">CREAR</span>;
      case 'EDITAR':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#b5dcfe]/50 text-[#3b617e]">EDITAR</span>;
      case 'ELIMINAR':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#93000a]">ELIMINAR</span>;
      case 'ESTADO':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#769b95]/20 text-[#416560]">ESTADO</span>;
      case 'LOGIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e9f0df] text-[#171d13]">LOGIN</span>;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13] tracking-tight">
            Log de Actividades & Auditoría
          </h1>
          <p className="text-sm md:text-base text-[#3f4a38] mt-1">
            Trazabilidad completa de operaciones, mutaciones de datos y eventos de seguridad en DynaPro.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-liquid text-white hover:bg-[#eff6e5] text-[#226d00] border border-[#39a900] font-montserrat font-bold text-xs md:text-sm px-6 h-12 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar Auditoría (CSV)
        </button>
      </div>

      {/* Filters Bar */}
      <div className="liquid-card rounded-2xl p-6 mb-8 border border-white/60 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f4a38]/70 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, acción o detalle..."
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-[#171d13] outline-none h-12"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer"
            >
              <option value="ALL">Todos los Módulos</option>
              <option value="Proyectos">Proyectos</option>
              <option value="Usuarios">Usuarios</option>
              <option value="Grupos">Grupos de Formación</option>
              <option value="Autenticación">Autenticación</option>
            </select>
          </div>

          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm text-[#171d13] outline-none h-12 cursor-pointer"
            >
              <option value="ALL">Todos los Tipos de Acción</option>
              <option value="CREAR">Creaciones</option>
              <option value="EDITAR">Modificaciones</option>
              <option value="ELIMINAR">Eliminaciones</option>
              <option value="ESTADO">Cambios de Estado</option>
              <option value="LOGIN">Inicios de Sesión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f0df]/80 border-b border-[#dee5d4] text-[11px] font-bold text-[#6f7b66] uppercase tracking-wider">
                <th className="py-4 px-6">Fecha y Hora</th>
                <th className="py-4 px-6">Usuario Responsable</th>
                <th className="py-4 px-6">Módulo</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Acción & Detalle</th>
                <th className="py-4 px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee5d4]/60 text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#eff6e5]/50 transition-colors">
                  <td className="py-4 px-6 text-xs text-[#3f4a38] font-mono whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#dee5d4] flex items-center justify-center text-xs font-bold text-[#226d00] shrink-0">
                        {log.user_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-[#171d13]">{log.user_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs font-semibold text-[#3c627f]">
                    {log.module}
                  </td>
                  <td className="py-4 px-6">
                    {getActionBadge(log.action_type)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-xs text-[#171d13]">{log.action_label}</p>
                    <p className="text-xs text-[#3f4a38] line-clamp-1">{log.detail}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setInspectedLog(log)}
                      className="p-1.5 text-[#3c627f] hover:text-[#171d13] hover:bg-[#dee5d4] rounded-lg transition-colors"
                      title="Inspeccionar evento"
                    >
                      <span className="material-symbols-outlined text-[18px]">info</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInspectedLog(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-white/60">
            <div className="flex justify-between items-center pb-4 border-b border-[#dee5d4] mb-4">
              <h3 className="font-montserrat font-bold text-base text-[#171d13]">
                Detalle del Registro de Auditoría
              </h3>
              <button onClick={() => setInspectedLog(null)} className="p-1 rounded-lg hover:bg-[#eff6e5]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-[#eff6e5] rounded-xl">
                <span className="font-bold text-[#6f7b66]">ID Registro:</span>
                <span className="font-mono text-[#171d13]">#{inspectedLog.id}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#eff6e5] rounded-xl">
                <span className="font-bold text-[#6f7b66]">Fecha y Hora:</span>
                <span className="font-mono text-[#171d13]">{inspectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#eff6e5] rounded-xl">
                <span className="font-bold text-[#6f7b66]">Usuario Responsable:</span>
                <span className="font-bold text-[#226d00]">{inspectedLog.user_name}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#eff6e5] rounded-xl">
                <span className="font-bold text-[#6f7b66]">Módulo Afectado:</span>
                <span className="font-semibold text-[#3c627f]">{inspectedLog.module}</span>
              </div>
              <div className="p-3 bg-[#f7f9fb] rounded-xl border border-[#dee5d4]">
                <span className="font-bold text-[#6f7b66] block mb-1">Descripción del Evento:</span>
                <p className="text-sm text-[#171d13] leading-relaxed">{inspectedLog.detail}</p>
              </div>

              {inspectedLog.payload && (
                <div className="p-3 bg-[#171d13] rounded-xl text-white font-mono text-[11px] overflow-x-auto max-h-40">
                  <span className="text-[#8afd5d] block mb-1">// Payload JSON:</span>
                  <pre>{JSON.stringify(inspectedLog.payload, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-5 py-2 rounded-xl bg-[#39a900] text-white font-montserrat font-bold text-xs hover:bg-[#226d00] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
