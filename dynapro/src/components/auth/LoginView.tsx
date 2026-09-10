import React, { useState } from 'react';
import { User, ActiveView } from '../../types';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  availableUsers: User[];
  setActiveView: (view: ActiveView) => void;
  onError: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  availableUsers,
  setActiveView,
  onError
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Por favor ingrese su correo electrónico institucional y contraseña.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      const message = err.message || 'Credenciales inválidas. Verifique su correo institucional y contraseña.';
      setErrorMsg(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('password');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full font-sans text-[#171d13] liquid-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Orbs for Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#39a900] opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#cbe6ff] opacity-25 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-3 sm:px-6 relative z-10 my-3">
        {/* Logo Container */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-[0_8px_32px_0_rgba(0,50,77,0.18)] mb-4 border border-white/40">
            <span className="material-symbols-outlined text-[42px] text-[#39a900]" style={{ fontVariationSettings: "'FILL' 1" }}>
              science
            </span>
          </div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-white mb-1 drop-shadow-sm tracking-tight">
            DynaPro
          </h1>
          <p className="text-sm font-medium text-[#b5dcfe] tracking-wide">
            SENA &bull; CLEM
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-card rounded-2xl p-5 sm:p-10 w-full relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39a900] to-transparent opacity-60 rounded-t-2xl" />

          <h2 className="font-montserrat text-2xl font-bold text-[#171d13] mb-6 text-center">
            Iniciar Sesión
          </h2>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-xs text-[#93000a] flex items-start gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#3f4a38] mb-1.5" htmlFor="email">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3c627f]">
                  <span className="material-symbols-outlined text-[20px] opacity-80">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@sena.edu.co"
                  className="w-full bg-[#f7f9fb]/90 border border-[#dee5d4] rounded-xl h-12 pl-11 pr-4 text-sm text-[#171d13] placeholder-[#3f4a38]/50 focus:bg-white focus:border-[#3c627f] focus:ring-4 focus:ring-[#3c627f]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#3f4a38]" htmlFor="password">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setActiveView('forgot-password')}
                  className="text-xs text-[#3c627f] hover:text-[#226d00] font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3c627f]">
                  <span className="material-symbols-outlined text-[20px] opacity-80">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f7f9fb]/90 border border-[#dee5d4] rounded-xl h-12 pl-11 pr-11 text-sm text-[#171d13] placeholder-[#3f4a38]/50 focus:bg-white focus:border-[#3c627f] focus:ring-4 focus:ring-[#3c627f]/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3c627f] hover:text-[#171d13] transition-colors"
                  aria-label="Ver u ocultar contraseña"
                >
                  <span className="material-symbols-outlined text-[20px] opacity-80">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-full flex items-center justify-center font-montserrat font-bold text-base text-white btn-liquid transition-all shadow-lg active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando...
                  </span>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Selector for Easy Testing */}
          {/* <div className="mt-6 pt-5 border-t border-[#dee5d4]/70">
            <p className="text-[11px] font-semibold text-[#6f7b66] text-center mb-2 uppercase tracking-wider">
              Acceso Rápido para Demostración:
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => handleQuickFill('amartinez@sena.edu.co')}
                className="text-[11px] py-1.5 px-2 bg-[#eff6e5] hover:bg-[#e4ebda] text-[#226d00] font-semibold rounded-lg transition-colors border border-[#dee5d4]"
              >
                👤 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cramirez@misena.edu.co')}
                className="text-[11px] py-1.5 px-2 bg-[#eff6e5] hover:bg-[#e4ebda] text-[#3c627f] font-semibold rounded-lg transition-colors border border-[#dee5d4]"
              >
                🎓 Instructor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('jperez@misena.edu.co')}
                className="text-[11px] py-1.5 px-2 bg-[#eff6e5] hover:bg-[#e4ebda] text-[#416560] font-semibold rounded-lg transition-colors border border-[#dee5d4]"
              >
                🌱 Aprendiz
              </button>
            </div>
          </div> */}

          <div className="mt-6 text-center border-t border-[#dee5d4]/50 pt-4">
            <p className="text-xs text-[#6f7b66]">
              Plataforma de Gestión de Proyectos de Investigación y Semilleros
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};
