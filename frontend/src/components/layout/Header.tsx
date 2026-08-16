import { useLocation, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const titles: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/pos':        'Facturación / POS',
  '/inventory':  'Inventario',
  '/reports':    'Reportes',
  '/audit-log':  'Bitácora de Auditoría',
  '/users':      'Gestión de Usuarios',
  '/roles':      'Roles y Permisos',
};

export default function Header() {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'Minisúper POS';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('es-CR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {pathname !== '/pos' && (
          <Link
            to="/pos"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Ir al POS
          </Link>
        )}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-700 text-xs font-bold">
              {currentUser?.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 leading-tight">{currentUser?.name}</p>
            <p className="text-xs text-slate-400">{currentUser?.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
