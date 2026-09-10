import React, { useState } from 'react';
import { ActiveView } from '../../types';

interface SupportViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const AboutView: React.FC<SupportViewProps> = ({ setActiveView }) => {
  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8 font-sans">
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/60 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#226d00] flex items-center justify-center shadow-lg">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/83/Sena_Colombia_logo.svg"
              alt="SENA Logo"
              className="w-9 h-9 invert brightness-0"
            />
          </div>
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold text-[#171d13] tracking-tight">
              Acerca de DynaPro
            </h1>
            <p className="text-sm font-semibold text-[#226d00]">
              Sistema de Información y Banco de Proyectos de Investigación &bull; SENA CLEM
            </p>
          </div>
        </div>

        <div className="prose prose-emerald max-w-none text-sm text-[#3f4a38] space-y-4 leading-relaxed">
          <p>
            <strong>DynaPro</strong> es la plataforma institucional desarrollada para el{' '}
            <strong>Centro Latinoamericano de Especies Menores (CLEM)</strong>, Regional Valle del Cauca,
            diseñada para unificar la formulación, registro, auditoría y preservación documental de las
            iniciativas de Investigación Aplicada, Desarrollo Tecnológico e Innovación (I+D+i).
          </p>
          <p>
            En articulación con el Sistema de Investigación, Desarrollo Tecnológico e Innovación del SENA (<strong>SENNOVA</strong>),
            DynaPro promueve la transferencia de conocimiento en áreas estratégicas como acuicultura,
            cunicultura, apicultura, biotecnología agropecuaria y tecnologías de la información.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-[#eff6e5] border border-[#dee5d4]">
            <h3 className="font-montserrat font-bold text-sm text-[#171d13] mb-1">Misión</h3>
            <p className="text-xs text-[#3f4a38]">
              Centralizar y proteger el patrimonio científico e investigativo generado por instructores y aprendices del CLEM.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#eff6e5] border border-[#dee5d4]">
            <h3 className="font-montserrat font-bold text-sm text-[#171d13] mb-1">Trazabilidad</h3>
            <p className="text-xs text-[#3f4a38]">
              Garantizar auditoría de acciones, control de cambios de estado y gestión de coautorías bajo estándares ISO.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#eff6e5] border border-[#dee5d4]">
            <h3 className="font-montserrat font-bold text-sm text-[#171d13] mb-1">Impacto Regional</h3>
            <p className="text-xs text-[#3f4a38]">
              Fomentar el desarrollo sostenible y la productividad del sector agropecuario del Valle del Cauca y Colombia.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#dee5d4] flex justify-end">
          <button
            onClick={() => setActiveView('projects')}
            className="btn-liquid text-white font-montserrat font-bold text-xs px-6 py-2.5 rounded-full shadow-md"
          >
            Ir al Banco de Proyectos
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacyView: React.FC<SupportViewProps> = ({ setActiveView }) => {
  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 font-sans">
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/60 shadow-xl space-y-6">
        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13]">
          Políticas de Privacidad y Tratamiento de Datos
        </h1>
        <p className="text-xs text-[#6f7b66] font-mono">
          Vigente según Ley Estatutaria 1581 de 2012 de Colombia (Habeas Data)
        </p>

        <div className="space-y-4 text-xs text-[#3f4a38] leading-relaxed">
          <h2 className="font-bold text-sm text-[#171d13]">1. Recolección de Información Institucional</h2>
          <p>
            El Servicio Nacional de Aprendizaje (SENA) CLEM recopila datos de identificación de instructores,
            investigadores y aprendices (nombres, documentos de identidad, correos institucionales) con el
            único propósito de atribuir autorías científicas y gestionar accesos al sistema DynaPro.
          </p>

          <h2 className="font-bold text-sm text-[#171d13]">2. Propiedad Intelectual y Confidencialidad</h2>
          <p>
            Los proyectos de investigación registrados en DynaPro están amparados por los lineamientos
            institucionales de Propiedad Intelectual del SENA. Los documentos adjuntos, anexos y metodologías
            cuentan con salvaguarda de confidencialidad para proteger patentes y registros de software.
          </p>

          <h2 className="font-bold text-sm text-[#171d13]">3. Seguridad y Auditoría</h2>
          <p>
            Todas las acciones realizadas en la plataforma son registradas en el log de auditoría del sistema
            para garantizar la integridad de los datos y prevenir accesos o modificaciones no autorizadas.
          </p>
        </div>

        <div className="pt-4 border-t border-[#dee5d4] flex justify-end">
          <button
            onClick={() => setActiveView('projects')}
            className="px-6 py-2.5 rounded-xl bg-[#eff6e5] text-[#171d13] font-semibold text-xs hover:bg-[#dee5d4]"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsView: React.FC<SupportViewProps> = ({ setActiveView }) => {
  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 font-sans">
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/60 shadow-xl space-y-6">
        <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13]">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-xs text-[#6f7b66] font-mono">
          Reglamento de Uso de la Plataforma DynaPro &bull; SENA CLEM
        </p>

        <div className="space-y-4 text-xs text-[#3f4a38] leading-relaxed">
          <h2 className="font-bold text-sm text-[#171d13]">1. Aceptación de los Términos</h2>
          <p>
            Al ingresar a la plataforma DynaPro con credenciales institucionales (@sena.edu.co o @misena.edu.co),
            el usuario acepta cumplir con las directrices académicas y de ética investigativa del SENA.
          </p>

          <h2 className="font-bold text-sm text-[#171d13]">2. Responsabilidad sobre los Contenidos</h2>
          <p>
            El Investigador Principal (IP) y los coautores son legalmente responsables de la veracidad y originalidad
            de las propuestas, datos experimentales y documentación anexa registrada en cada proyecto.
          </p>

          <h2 className="font-bold text-sm text-[#171d13]">3. Prohibición de Duplicidad</h2>
          <p>
            Queda expresamente prohibido radicar proyectos con títulos duplicados o contenidos plagiados. El sistema
            cuenta con validación algorítmica de duplicidad y control de versiones.
          </p>
        </div>

        <div className="pt-4 border-t border-[#dee5d4] flex justify-end">
          <button
            onClick={() => setActiveView('projects')}
            className="px-6 py-2.5 rounded-xl bg-[#eff6e5] text-[#171d13] font-semibold text-xs hover:bg-[#dee5d4]"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export const FaqView: React.FC<SupportViewProps> = ({ setActiveView }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo registro un nuevo proyecto de investigación?',
      a: 'Para registrar un proyecto, diríjase a la sección "Banco de Proyectos" o "Tablero" y presione el botón verde "+ Registrar Nuevo Proyecto". Complete los 3 pasos: Datos Básicos (título sin duplicidad, abstract, objetivos), Autoría y Centro de Formación, y Anexos documentales.'
    },
    {
      q: '¿Qué formatos y tamaños de archivo se aceptan en los anexos?',
      a: 'DynaPro admite archivos en formato PDF, Word (.doc, .docx) y Excel (.xls, .xlsx) con un tamaño máximo permitido de 20 MB por archivo.'
    },
    {
      q: '¿Quién puede editar o eliminar un proyecto registrado?',
      a: 'Por políticas de Control de Acceso Basado en Roles (RBAC), únicamente el Investigador Principal (creador) o los Administradores del sistema tienen permisos de modificación y eliminación lógica sobre un proyecto.'
    },
    {
      q: '¿Cómo funciona la validación anti-duplicidad de títulos?',
      a: 'El sistema normaliza automáticamente el título ingresado (remueve acentos, espacios adicionales y mayúsculas) y valida en tiempo real contra los proyectos vigentes en la base de datos para prevenir registros duplicados.'
    }
  ];

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 font-sans">
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/60 shadow-xl space-y-6">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13]">
            Preguntas Frecuentes (FAQ)
          </h1>
          <p className="text-sm text-[#3f4a38] mt-1">
            Guía de consulta rápida para investigadores y administradores de DynaPro.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#eff6e5] border border-[#dee5d4] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 text-left flex justify-between items-center font-montserrat font-bold text-sm text-[#171d13]"
              >
                <span>{faq.q}</span>
                <span className="material-symbols-outlined text-[#39a900]">
                  {openIndex === index ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#3f4a38] leading-relaxed border-t border-[#dee5d4]/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#dee5d4] flex justify-end">
          <button
            onClick={() => setActiveView('projects')}
            className="px-6 py-2.5 rounded-xl bg-[#eff6e5] text-[#171d13] font-semibold text-xs hover:bg-[#dee5d4]"
          >
            Volver al Banco
          </button>
        </div>
      </div>
    </div>
  );
};

export const CaseStudiesView: React.FC<SupportViewProps> = ({ setActiveView }) => {
  const cases = [
    {
      title: 'Sistema Acuapónico Automatizado con Energía Solar',
      author: 'Carlos Ramírez & Ficha 2694120',
      tag: 'Acuicultura & Energías Renovables',
      description: 'Implementación de circuito cerrado de recirculación para tilapia roja con aprovechamiento de nutrientes para hortalizas hidropónicas en las instalaciones del CLEM.',
      budget: '$45.000.000 COP'
    },
    {
      title: 'Biotransformación de Residuos con Larva Mosca Soldado Negro',
      author: 'Ana Martínez & Laura Gómez',
      tag: 'Biotecnología & Nutrición Animal',
      description: 'Producción de harina hiperproteica a partir de Hermetia illucens para alimentación avícola y piscícola sustentable en el Valle del Cauca.',
      budget: '$38.500.000 COP'
    },
    {
      title: 'IoT y Sensores Ambientales para Apicultura de Precisión',
      author: 'Juan Pérez & Equipo SENNOVA',
      tag: 'TIC & Agroindustria',
      description: 'Monitoreo acústico y térmico no invasivo de colmenas de Apis mellifera con alertas tempranas vía dashboard en tiempo real.',
      budget: '$28.000.000 COP'
    }
  ];

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 font-sans">
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/60 shadow-xl space-y-6">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#171d13]">
            Casos de Éxito de Investigación CLEM
          </h1>
          <p className="text-sm text-[#3f4a38] mt-1">
            Proyectos insignes formulados y ejecutados con impacto regional y tecnológico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#eff6e5] border border-[#dee5d4] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#b5dcfe]/50 text-[#3b617e] mb-2 inline-block">
                  {c.tag}
                </span>
                <h3 className="font-montserrat font-bold text-sm text-[#171d13] mb-2">{c.title}</h3>
                <p className="text-xs text-[#3f4a38] leading-relaxed mb-3">{c.description}</p>
              </div>
              <div className="pt-3 border-t border-[#dee5d4] flex justify-between items-center text-xs">
                <span className="text-[#6f7b66]">{c.author}</span>
                <span className="font-bold text-[#226d00]">{c.budget}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#dee5d4] flex justify-end">
          <button
            onClick={() => setActiveView('projects')}
            className="btn-liquid text-white font-montserrat font-bold text-xs px-6 py-2.5 rounded-full shadow-md"
          >
            Explorar Todos los Proyectos
          </button>
        </div>
      </div>
    </div>
  );
};
