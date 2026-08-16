import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { mockUsers, type MockUser, type UserRole } from '../data/mockUsers';
import { useRoles } from './RolesContext';

interface AuthContextValue {
  currentUser: MockUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  can: (permission: string) => boolean;
  refreshCurrentUser: () => void;
}

const STORAGE_KEY = 'minisuper_user';
const USERS_KEY   = 'minisuper_users';

const getUsers = (): MockUser[] => {
  try {
    const s = localStorage.getItem(USERS_KEY);
    return s ? JSON.parse(s) : mockUsers;
  } catch {
    return mockUsers;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { hasPermission } = useRoles();

  const [currentUser, setCurrentUser] = useState<MockUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.active !== false);
    if (user) {
      const updated = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshCurrentUser = useCallback(() => {
    if (!currentUser) return;
    const users = getUsers();
    const fresh = users.find(u => u.id === currentUser.id);
    if (fresh) {
      setCurrentUser(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
  }, [currentUser]);

  const hasRole = useCallback((role: UserRole) => currentUser?.role === role, [currentUser]);

  const can = useCallback(
    (permission: string) => currentUser ? hasPermission(currentUser.role, permission) : false,
    [currentUser, hasPermission],
  );

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout, hasRole, can, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
