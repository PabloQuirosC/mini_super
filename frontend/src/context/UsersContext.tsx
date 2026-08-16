import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { mockUsers, type MockUser, type UserRole } from '../data/mockUsers';

type NewUser = Omit<MockUser, 'id' | 'createdAt' | 'lastLogin'>;
type UpdateUser = Partial<Omit<MockUser, 'id' | 'createdAt'>>;

interface UsersContextValue {
  users: MockUser[];
  addUser: (u: NewUser) => MockUser;
  updateUser: (id: number, data: UpdateUser) => void;
  deleteUser: (id: number) => void;
  getUserById: (id: number) => MockUser | undefined;
  isUsernameTaken: (username: string, excludeId?: number) => boolean;
  isEmailTaken: (email: string, excludeId?: number) => boolean;
}

const STORAGE_KEY = 'minisuper_users';

const load = (): MockUser[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : mockUsers;
  } catch {
    return mockUsers;
  }
};

const save = (users: MockUser[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

const UsersContext = createContext<UsersContextValue | null>(null);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<MockUser[]>(load);

  const set = (next: MockUser[]) => { setUsers(next); save(next); };

  const addUser = useCallback((u: NewUser): MockUser => {
    const newUser: MockUser = {
      ...u,
      id: Math.max(0, ...users.map(x => x.id)) + 1,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => { const next = [...prev, newUser]; save(next); return next; });
    return newUser;
  }, [users]);

  const updateUser = useCallback((id: number, data: UpdateUser) => {
    setUsers(prev => { const next = prev.map(u => u.id === id ? { ...u, ...data } : u); save(next); return next; });
  }, []);

  const deleteUser = useCallback((id: number) => {
    setUsers(prev => { const next = prev.filter(u => u.id !== id); save(next); return next; });
  }, []);

  const getUserById = useCallback((id: number) => users.find(u => u.id === id), [users]);

  const isUsernameTaken = useCallback((username: string, excludeId?: number) =>
    users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== excludeId), [users]);

  const isEmailTaken = useCallback((email: string, excludeId?: number) =>
    users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId), [users]);

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserById, isUsernameTaken, isEmailTaken }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};
