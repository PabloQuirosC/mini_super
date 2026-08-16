import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, BarChart3, ClipboardList, LogOut, Store, Menu, X, Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useAudit } from '../../context/AuditContext';
import { getInitials } from '../../utils/format';

const nav = [
  { to: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard, perm: 'dashboard:view'  },
  { to: '/pos',        label: 'Facturación',   icon: ShoppingCart,    perm: 'pos:view'        },
  { to: '/inventory',  label: 'Inventario',    icon: Package,         perm: 'inventory:view'  },
  { to: '/reports',    label: 'Reportes',      icon: BarChart3,       perm: 'reports:view'    },
  { to: '/audit-log',  label: 'Bitácora',      icon: ClipboardList,   perm: 'auditlog:view'   },
  { to: '/users',      label: 'Usuarios',      icon: Users,           perm: 'users:view'      },
  { to: '/roles',      label: 'Roles y Permisos', icon: ShieldCheck,  perm: 'roles:view'      },
];

export default function Sidebar() {
  const { currentUser, logout, can } = useAuth();
  const { showModal, closeModal } = useModal();
  const { addLog } = useAudit();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    showModal({
      type: 'confirm',
      title: 'Cerrar sesión',
      message: '¿Deseas cerrar sesión del sistema?',
      confirmLabel: 'Cerrar sesión',
      onConfirm: () => {
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'LOGOUT', module: 'Autenticación', description: 'Cierre de sesión', severity: 'info' });
        logout();
        navigate('/login');
        closeModal();
      },
    });
  };

  const visible = nav.filter(n => can(n.perm));

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-display)' }}>MINISÚPER</p>
          <p className="text-emerald-400 text-xs font-mono tracking-wider">POS SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-slate-700/60 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 text-xs font-bold">{getInitials(currentUser?.name ?? '')}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{currentUser?.name}</p>
            <p className="text-slate-400 text-xs capitalize">{currentUser?.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-slate-900 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-40 w-56 bg-slate-900 flex flex-col lg:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
