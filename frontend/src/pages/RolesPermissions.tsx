import { useState } from 'react';
import { ShieldCheck, Save, RotateCcw, ChevronRight, Lock } from 'lucide-react';
import { useRoles } from '../context/RolesContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import { ROLES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, type RoleDef } from '../data/mockRoles';
import Badge from '../components/common/Badge';

const roleColors: Record<string, 'success' | 'info' | 'warning'> = {
  admin: 'warning', supervisor: 'info', cashier: 'success',
};

const MODULE_ICONS: Record<string, string> = {
  Dashboard: '📊', POS: '🛒', Inventario: '📦',
  Reportes: '📈', Bitácora: '📋', Usuarios: '👥', Roles: '🔐',
};

interface RoleCardProps {
  role: RoleDef;
  permCount: number;
  isSelected: boolean;
  onClick: () => void;
}

function RoleCard({ role, permCount, isSelected, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            role.color === 'purple' ? 'bg-purple-100' :
            role.color === 'blue'   ? 'bg-blue-100'   : 'bg-emerald-100'
          }`}>
            <ShieldCheck className={`w-5 h-5 ${
              role.color === 'purple' ? 'text-purple-600' :
              role.color === 'blue'   ? 'text-blue-600'   : 'text-emerald-600'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">{role.label}</p>
            <p className="text-xs text-slate-400">{permCount} permisos activos</p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-emerald-500' : 'text-slate-300'}`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{role.description}</p>
    </button>
  );
}

export default function RolesPermissions() {
  const { rolePermissions, setRolePermissions } = useRoles();
  const { can, currentUser } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();

  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [draft, setDraft] = useState<Record<string, string[]>>(() => ({ ...rolePermissions }));
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const canEdit = can('roles:edit');

  const toggle = (roleKey: string, permKey: string) => {
    if (!canEdit) {
      showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para modificar roles.' });
      return;
    }
    if (roleKey === 'admin') {
      showModal({ type: 'warning', title: 'Rol protegido', message: 'El rol Administrador siempre tiene acceso completo y no puede ser modificado.' });
      return;
    }
    setDraft(prev => {
      const current = prev[roleKey] ?? [];
      const next = current.includes(permKey) ? current.filter(p => p !== permKey) : [...current, permKey];
      return { ...prev, [roleKey]: next };
    });
    setDirty(d => ({ ...d, [roleKey]: true }));
  };

  const handleSave = (roleKey: string) => {
    showModal({
      type: 'confirm', title: 'Guardar permisos',
      message: `¿Deseas guardar los cambios de permisos para el rol ${ROLES.find(r => r.key === roleKey)?.label}?`,
      confirmLabel: 'Guardar',
      onConfirm: () => {
        setRolePermissions(roleKey, draft[roleKey] ?? []);
        setDirty(d => ({ ...d, [roleKey]: false }));
        const role = ROLES.find(r => r.key === roleKey);
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'ROLE_PERMISSIONS_UPDATED', module: 'Autenticación', description: `Actualizó los permisos del rol ${role?.label}`, severity: 'warning' });
        showModal({ type: 'success', title: 'Permisos guardados', message: `Los permisos del rol ${role?.label} fueron actualizados.` });
      },
    });
  };

  const handleReset = (roleKey: string) => {
    showModal({
      type: 'confirm', title: 'Restaurar permisos',
      message: 'Se restaurarán los permisos predeterminados para este rol. ¿Continuar?',
      confirmLabel: 'Restaurar',
      onConfirm: () => {
        setDraft(prev => ({ ...prev, [roleKey]: [...(DEFAULT_ROLE_PERMISSIONS[roleKey] ?? [])] }));
        setDirty(d => ({ ...d, [roleKey]: true }));
      },
    });
  };

  const modules = [...new Set(ALL_PERMISSIONS.map(p => p.module))];

  const selectedPerms = draft[selectedRole] ?? [];
  const isDirty = dirty[selectedRole];
  const isAdminRole = selectedRole === 'admin';

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Los permisos frontend controlan qué ve y accede cada rol en esta interfaz. La autorización real debe validarse siempre en el backend antes de procesar cualquier operación sensible.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Role selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Seleccionar rol</h3>
          {ROLES.map(role => (
            <RoleCard
              key={role.key}
              role={role}
              permCount={(draft[role.key] ?? []).length}
              isSelected={selectedRole === role.key}
              onClick={() => setSelectedRole(role.key)}
            />
          ))}
        </div>

        {/* Permissions editor */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
                {ROLES.find(r => r.key === selectedRole)?.label}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPerms.length} de {ALL_PERMISSIONS.length} permisos habilitados
              </p>
            </div>
            {canEdit && !isAdminRole && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleReset(selectedRole)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Restaurar
                </button>
                {isDirty && (
                  <button onClick={() => handleSave(selectedRole)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shadow-sm">
                    <Save className="w-3 h-3" /> Guardar cambios
                  </button>
                )}
              </div>
            )}
          </div>

          {isAdminRole && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
              <p className="text-xs text-purple-700">El Administrador tiene acceso completo a todos los módulos y no puede ser restringido.</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {modules.map((module, mi) => {
              const perms = ALL_PERMISSIONS.filter(p => p.module === module);
              const active = perms.filter(p => selectedPerms.includes(p.key)).length;
              return (
                <div key={module} className={mi > 0 ? 'border-t border-slate-100' : ''}>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span>{MODULE_ICONS[module] ?? '⚙️'}</span>
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{module}</span>
                    </div>
                    <span className="text-xs text-slate-400">{active}/{perms.length}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {perms.map(perm => {
                      const enabled = selectedPerms.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-center gap-4 px-4 py-3 transition-colors ${isAdminRole ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50/80'}`}
                        >
                          <div
                            onClick={() => toggle(selectedRole, perm.key)}
                            className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                              enabled ? 'bg-emerald-500' : 'bg-slate-200'
                            } ${isAdminRole ? 'opacity-80' : ''}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{perm.label}</p>
                              <Badge variant={enabled ? 'success' : 'neutral'} size="sm">
                                {enabled ? 'Habilitado' : 'Deshabilitado'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison across roles */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Comparación entre roles</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 text-slate-500 font-semibold">Permiso</th>
                    {ROLES.map(r => (
                      <th key={r.key} className="text-center px-3 py-2.5">
                        <Badge variant={roleColors[r.key]}>{r.label}</Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_PERMISSIONS.map((perm, i) => (
                    <tr key={perm.key} className={`border-t border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                      <td className="px-4 py-2 text-slate-700">
                        <span className="text-slate-400 text-xs mr-1">[{perm.module}]</span>
                        {perm.label}
                      </td>
                      {ROLES.map(r => {
                        const has = (draft[r.key] ?? []).includes(perm.key);
                        return (
                          <td key={r.key} className="px-3 py-2 text-center">
                            <span className={`inline-block w-4 h-4 rounded-full ${has ? 'bg-emerald-500' : 'bg-slate-200'}`} title={has ? 'Habilitado' : 'Deshabilitado'} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
