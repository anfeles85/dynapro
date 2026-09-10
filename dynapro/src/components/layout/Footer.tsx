import React from 'react';
import { ActiveView } from '../../types';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#e9f0df]/60 border-t border-white/40 mt-auto py-8 px-6 md:px-12 text-[#3f4a38]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#226d00] flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
              alt="SENA Logo"
              className="w-4 h-4 invert brightness-0"
            />
          </div>
          <p className="text-xs">
            <span className="font-bold text-[#171d13]">DynaPro</span> &copy; {currentYear} &mdash; Centro Latinoamericano de Especies Menores (CLEM). Regional Valle del Cauca.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
          <button
            onClick={() => setActiveView('about')}
            className="hover:text-[#226d00] transition-colors"
          >
            Acerca de
          </button>
          <button
            onClick={() => setActiveView('case-studies')}
            className="hover:text-[#226d00] transition-colors"
          >
            Casos de Éxito
          </button>
          <button
            onClick={() => setActiveView('faq')}
            className="hover:text-[#226d00] transition-colors"
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => setActiveView('privacy')}
            className="hover:text-[#226d00] transition-colors"
          >
            Políticas de Privacidad
          </button>
          <button
            onClick={() => setActiveView('terms')}
            className="hover:text-[#226d00] transition-colors"
          >
            Términos y Condiciones
          </button>

        </div>
      </div>
    </footer>
  );
};
