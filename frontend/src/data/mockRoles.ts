export interface RoleDef {
  key: string;
  label: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

export const ROLES: RoleDef[] = [
  {
    key: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema. Gestiona usuarios, inventario, reportes y configuración.',
    color: 'purple',
  },
  {
    key: 'supervisor',
    label: 'Supervisor',
    description: 'Supervisa operaciones, accede a reportes e inventario. No puede eliminar productos ni gestionar usuarios.',
    color: 'blue',
  },
  {
    key: 'cashier',
    label: 'Cajero',
    description: 'Operaciones en caja: ventas, consulta de inventario y reportes básicos.',
    color: 'emerald',
  },
];

export interface PermissionDef {
  key: string;
  label: string;
  module: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  // Dashboard
  { key: 'dashboard:view',      label: 'Ver dashboard',        module: 'Dashboard',  description: 'Acceso a la pantalla principal con métricas' },
  // POS
  { key: 'pos:view',            label: 'Usar facturación',     module: 'POS',        description: 'Procesar ventas y cobros' },
  // Inventory
  { key: 'inventory:view',      label: 'Ver inventario',       module: 'Inventario', description: 'Consultar listado de productos' },
  { key: 'inventory:create',    label: 'Crear productos',      module: 'Inventario', description: 'Agregar nuevos productos al catálogo' },
  { key: 'inventory:edit',      label: 'Editar productos',     module: 'Inventario', description: 'Modificar datos de productos existentes' },
  { key: 'inventory:delete',    label: 'Eliminar productos',   module: 'Inventario', description: 'Eliminar productos del catálogo' },
  // Reports
  { key: 'reports:view',        label: 'Ver reportes',         module: 'Reportes',   description: 'Consultar reportes de ventas' },
  { key: 'reports:export',      label: 'Exportar reportes',    module: 'Reportes',   description: 'Descargar reportes en formato CSV' },
  // Audit
  { key: 'auditlog:view',       label: 'Ver bitácora',         module: 'Bitácora',   description: 'Consultar registro de auditoría del sistema' },
  // Users
  { key: 'users:view',          label: 'Ver usuarios',         module: 'Usuarios',   description: 'Consultar listado de usuarios del sistema' },
  { key: 'users:create',        label: 'Crear usuarios',       module: 'Usuarios',   description: 'Registrar nuevos usuarios' },
  { key: 'users:edit',          label: 'Editar usuarios',      module: 'Usuarios',   description: 'Modificar datos y roles de usuarios' },
  { key: 'users:delete',        label: 'Eliminar usuarios',    module: 'Usuarios',   description: 'Desactivar o eliminar cuentas de usuario' },
  // Roles
  { key: 'roles:view',          label: 'Ver roles',            module: 'Roles',      description: 'Consultar roles y permisos del sistema' },
  { key: 'roles:edit',          label: 'Editar permisos',      module: 'Roles',      description: 'Modificar permisos asignados a cada rol' },
];

// Default permission sets per role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.key),
  supervisor: [
    'dashboard:view', 'pos:view',
    'inventory:view', 'inventory:edit',
    'reports:view', 'reports:export',
    'auditlog:view',
    'users:view',
    'roles:view',
  ],
  cashier: [
    'dashboard:view', 'pos:view',
    'inventory:view',
    'reports:view',
  ],
};
