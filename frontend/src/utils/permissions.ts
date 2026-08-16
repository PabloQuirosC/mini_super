// Static fallback used only if RolesContext is unavailable.
// Runtime permission checks go through RolesContext.hasPermission().
export const STATIC_ADMIN_PERMISSIONS = [
  'dashboard:view', 'pos:view',
  'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete',
  'reports:view', 'reports:export',
  'auditlog:view',
  'users:view', 'users:create', 'users:edit', 'users:delete',
  'roles:view', 'roles:edit',
];
