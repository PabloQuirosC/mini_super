import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import Modal from '../components/common/Modal';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showModal({ type: 'warning', title: 'Campos requeridos', message: 'Por favor ingresa tu usuario y contraseña.' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(username.trim(), password);
    setLoading(false);

    if (ok) {
      addLog({ userId: 0, userName: username, action: 'LOGIN_SUCCESS', module: 'Autenticación', description: `Inicio de sesión exitoso — ${username}`, severity: 'success' });
      navigate('/dashboard');
    } else {
      addLog({ userId: 0, userName: username, action: 'LOGIN_FAILED', module: 'Autenticación', description: `Intento de inicio de sesión fallido — ${username}`, severity: 'error' });
      showModal({ type: 'error', title: 'Credenciales incorrectas', message: 'El usuario o contraseña ingresados no son válidos. Verifica e intenta de nuevo.' });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2d1f 100%)' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>MINISÚPER</p>
              <p className="text-emerald-400 text-xs font-mono tracking-widest">POS SYSTEM</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              Sistema de Punto<br />de Venta Completo
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              Control total de inventario, ventas y reportes para tu negocio.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['Ventas', 'Registro instantáneo'], ['Inventario', 'Control en tiempo real'], ['Reportes', 'Métricas detalladas']].map(([t, d]) => (
              <div key={t} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-emerald-400 font-semibold text-sm">{t}</p>
                <p className="text-slate-400 text-xs mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">© 2026 Minisúper POS — Sistema administrativo</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>MINISÚPER POS</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-7">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Iniciar sesión</h3>
              <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin o cajero"
                    autoComplete="username"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm shadow-emerald-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Usuarios de prueba</p>
              <div className="space-y-1 font-mono text-xs text-slate-600">
                <p><span className="text-emerald-600">admin</span> / admin123 — Administrador</p>
                <p><span className="text-emerald-600">cajero</span> / cajero123 — Cajero</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal />
    </div>
  );
}
