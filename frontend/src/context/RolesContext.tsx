import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockRoles';

interface RolesContextValue {
  rolePermissions: Record<string, string[]>;
  setRolePermissions: (role: string, perms: string[]) => void;
  hasPermission: (role: string, perm: string) => boolean;
}

const STORAGE_KEY = 'minisuper_role_permissions';

const load = (): Record<string, string[]> => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : DEFAULT_ROLE_PERMISSIONS;
  } catch {
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

const save = (rp: Record<string, string[]>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rp));

const RolesContext = createContext<RolesContextValue | null>(null);

export const RolesProvider = ({ children }: { children: ReactNode }) => {
  const [rolePermissions, setRolePermsState] = useState<Record<string, string[]>>(load);

  const setRolePermissions = useCallback((role: string, perms: string[]) => {
    setRolePermsState(prev => {
      const next = { ...prev, [role]: perms };
      save(next);
      return next;
    });
  }, []);

  const hasPermission = useCallback((role: string, perm: string): boolean =>
    rolePermissions[role]?.includes(perm) ?? false, [rolePermissions]);

  return (
    <RolesContext.Provider value={{ rolePermissions, setRolePermissions, hasPermission }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error('useRoles must be used within RolesProvider');
  return ctx;
};
