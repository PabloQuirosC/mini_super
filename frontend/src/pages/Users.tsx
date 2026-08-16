import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, UserCheck, UserX, Search, ShieldCheck, Eye, EyeOff, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import { formatDateTime, getInitials } from '../utils/format';
import { ROLES } from '../data/mockRoles';
import type { MockUser, UserRole } from '../data/mockUsers';
import Badge from '../components/common/Badge';

const roleBadge = (role: UserRole) => {
  const map: Record<UserRole, 'success' | 'info' | 'warning'> = { admin: 'warning', supervisor: 'info', cashier: 'success' };
  const label: Record<UserRole, string> = { admin: 'Administrador', supervisor: 'Supervisor', cashier: 'Cajero' };
  return <Badge variant={map[role]}>{label[role]}</Badge>;
};

interface FormState {
  username: string; name: string; email: string;
  password: string; confirmPassword: string;
  role: UserRole; active: boolean;
}

const emptyForm = (): FormState => ({
  username: '', name: '', email: '', password: '', confirmPassword: '',
  role: 'cashier', active: true,
});

export default function Users() {
  const { users, addUser, updateUser, deleteUser, isUsernameTaken, isEmailTaken } = useUsers();
  const { can, currentUser } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPass, setShowPass] = useState(false);

  const filtered = useMemo(() => users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  ), [users, search, roleFilter]);

  const openAdd = () => {
    if (!can('users:create')) { denied(); return; }
    setForm(emptyForm()); setEditingId(null); setErrors({}); setShowPass(false); setShowForm(true);
  };

  const openEdit = (u: MockUser) => {
    if (!can('users:edit')) { denied(); return; }
    setForm({ username: u.username, name: u.name, email: u.email, password: '', confirmPassword: '', role: u.role, active: u.active ?? true });
    setEditingId(u.id); setErrors({}); setShowPass(false); setShowForm(true);
  };

  const denied = () => showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para realizar esta acción.' });

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.username.trim()) e.username = 'Requerido';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username.trim())) e.username = 'Solo letras minúsculas, números y _ (3-20 chars)';
    else if (isUsernameTaken(form.username.trim(), editingId ?? undefined)) e.username = 'El usuario ya existe';
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.email.trim()) e.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Correo inválido';
    else if (isEmailTaken(form.email.trim(), editingId ?? undefined)) e.email = 'El correo ya está registrado';
    if (!editingId) {
      if (!form.password) e.password = 'Requerido';
      else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    } else if (form.password) {
      if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const base = { username: form.username.trim(), name: form.name.trim(), email: form.email.trim(), role: form.role, active: form.active };

    if (editingId) {
      const update = form.password ? { ...base, password: form.password } : base;
      updateUser(editingId, update);
      addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'USER_UPDATED', module: 'Autenticación', description: `Actualizó el usuario ${form.name}`, severity: 'info' });
      showModal({ type: 'success', title: 'Usuario actualizado', message: `Los datos de ${form.name} fueron guardados correctamente.` });
    } else {
      const newUser = addUser({ ...base, password: form.password });
      addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'USER_CREATED', module: 'Autenticación', description: `Creó el usuario ${form.name} con rol ${form.role}`, severity: 'info' });
      showModal({ type: 'success', title: 'Usuario creado', message: `${newUser.name} fue registrado correctamente como ${form.role}.` });
    }
    setShowForm(false);
  };

  const handleToggleActive = (u: MockUser) => {
    if (!can('users:edit')) { denied(); return; }
    if (u.id === currentUser?.id) {
      showModal({ type: 'error', title: 'Acción no permitida', message: 'No puedes desactivar tu propia cuenta.' });
      return;
    }
    const next = !u.active;
    showModal({
      type: 'confirm',
      title: next ? 'Activar usuario' : 'Desactivar usuario',
      message: `¿Deseas ${next ? 'activar' : 'desactivar'} la cuenta de ${u.name}?${!next ? ' No podrá iniciar sesión.' : ''}`,
      confirmLabel: next ? 'Activar' : 'Desactivar',
      onConfirm: () => {
        updateUser(u.id, { active: next });
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: next ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', module: 'Autenticación', description: `${next ? 'Activó' : 'Desactivó'} la cuenta de ${u.name}`, severity: next ? 'success' : 'warning' });
      },
    });
  };

  const handleDelete = (u: MockUser) => {
    if (!can('users:delete')) { denied(); return; }
    if (u.id === currentUser?.id) {
      showModal({ type: 'error', title: 'Acción no permitida', message: 'No puedes eliminar tu propia cuenta.' });
      return;
    }
    showModal({
      type: 'confirm', title: 'Eliminar usuario',
      message: `¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${u.name}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        deleteUser(u.id);
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'USER_DELETED', module: 'Autenticación', description: `Eliminó el usuario ${u.name}`, severity: 'warning' });
      },
    });
  };

  const f = (key: keyof FormState, label: string, rest?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
      <input
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${errors[key] ? 'border-red-400' : 'border-slate-200'}`}
        {...rest}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.active !== false).length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total usuarios', value: stats.total, icon: <UsersIcon className="w-4 h-4 text-slate-500" /> },
          { label: 'Usuarios activos', value: stats.active, icon: <UserCheck className="w-4 h-4 text-emerald-500" /> },
          { label: 'Administradores', value: stats.admins, icon: <ShieldCheck className="w-4 h-4 text-purple-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, usuario o correo..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-600">
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        {can('users:create') && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo usuario
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Usuario', 'Nombre', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Creado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No se encontraron usuarios</p>
                </td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className={`border-t border-slate-100 transition-colors ${u.active === false ? 'opacity-50' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${u.active === false ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {getInitials(u.name)}
                      </div>
                      <span className="font-mono text-slate-600">@{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3">
                    {u.active === false
                      ? <Badge variant="error">Inactivo</Badge>
                      : <Badge variant="success">Activo</Badge>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{u.lastLogin ? formatDateTime(u.lastLogin) : '—'}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {can('users:edit') && (
                        <>
                          <button onClick={() => openEdit(u)} title="Editar" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggleActive(u)} title={u.active === false ? 'Activar' : 'Desactivar'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${u.active === false ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                            {u.active === false ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}
                      {can('users:delete') && u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u)} title="Eliminar" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 bg-slate-50">
          {filtered.length} de {users.length} usuarios
        </div>
      </div>

      {/* User form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 fade-in"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {editingId ? 'Editar usuario' : 'Nuevo usuario'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {f('name', 'Nombre completo', { placeholder: 'Ej: Ana Pérez' })}
              {f('username', 'Nombre de usuario', { placeholder: 'solo_minusculas_sin_espacios', autoComplete: 'off', disabled: !!editingId })}
              {f('email', 'Correo electrónico', { type: 'email', placeholder: 'correo@minisuper.com' })}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Rol</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500">
                  {ROLES.map(r => <option key={r.key} value={r.key}>{r.label} — {r.description.split('.')[0]}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  {editingId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder={editingId ? '(sin cambios)' : 'Mínimo 6 caracteres'}
                    autoComplete="new-password"
                    className={`w-full pr-10 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
              </div>

              {(form.password || !editingId) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Confirmar contraseña</label>
                  <input
                    type="password" value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repetir contraseña"
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-0.5">{errors.confirmPassword}</p>}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm text-slate-700">Usuario activo</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                {editingId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
