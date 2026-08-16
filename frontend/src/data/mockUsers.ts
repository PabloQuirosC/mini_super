export type UserRole = 'admin' | 'cashier' | 'supervisor';

export interface MockUser {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    email: 'admin@minisuper.com',
    active: true,
    createdAt: '2026-01-01T08:00:00',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'cajero',
    password: 'cajero123',
    name: 'Cajero Principal',
    role: 'cashier',
    email: 'cajero@minisuper.com',
    active: true,
    createdAt: '2026-01-15T09:00:00',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    username: 'maria',
    password: 'maria123',
    name: 'María López',
    role: 'cashier',
    email: 'maria@minisuper.com',
    active: true,
    createdAt: '2026-02-10T10:00:00',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    username: 'supervisor',
    password: 'super123',
    name: 'Carlos Rodríguez',
    role: 'supervisor',
    email: 'carlos@minisuper.com',
    active: true,
    createdAt: '2026-03-05T11:00:00',
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 5,
    username: 'pedro',
    password: 'pedro123',
    name: 'Pedro Jiménez',
    role: 'cashier',
    email: 'pedro@minisuper.com',
    active: false,
    createdAt: '2026-04-20T08:30:00',
  },
];
