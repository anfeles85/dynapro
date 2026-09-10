import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColors = {
    success: 'bg-white border-l-4 border-l-[#39a900] text-[#171d13]',
    error: 'bg-white border-l-4 border-l-[#ba1a1a] text-[#171d13]',
    info: 'bg-white border-l-4 border-l-[#3c627f] text-[#171d13]',
    warning: 'bg-white border-l-4 border-l-[#e67e22] text-[#171d13]'
  };

  const iconNames = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const iconColors = {
    success: 'text-[#39a900]',
    error: 'text-[#ba1a1a]',
    info: 'text-[#3c627f]',
    warning: 'text-[#e67e22]'
  };

  return (
    <div
      className={`pointer-events-auto rounded-xl shadow-xl p-4 border border-white/60 flex items-start gap-3 transition-all transform translate-y-0 opacity-100 ${bgColors[toast.type]}`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <span className={`material-symbols-outlined text-[24px] shrink-0 ${iconColors[toast.type]}`}>
        {iconNames[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm font-montserrat">{toast.title}</h4>
        <p className="text-xs text-[#3f4a38] mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-[#6f7b66] hover:text-[#171d13] p-1 rounded-lg transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};
