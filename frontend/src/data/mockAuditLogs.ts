export type AuditSeverity = 'info' | 'warning' | 'error' | 'success';
export type AuditModule = 'Autenticación' | 'POS' | 'Inventario' | 'Reportes' | 'Seguridad';

export interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  action: string;
  module: AuditModule;
  description: string;
  severity: AuditSeverity;
}

const now = new Date();
const ts = (minsAgo: number) => {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - minsAgo);
  return d.toISOString();
};

export const initialAuditLogs: AuditLog[] = [
  { id: 1,  timestamp: ts(0),    userId: 1, userName: 'Administrador',    action: 'LOGIN_SUCCESS',          module: 'Autenticación', description: 'Inicio de sesión exitoso',                         severity: 'success' },
  { id: 2,  timestamp: ts(5),    userId: 1, userName: 'Administrador',    action: 'PRODUCT_UPDATED',        module: 'Inventario',    description: 'Actualizó el producto Coca-Cola 600ml',            severity: 'info'    },
  { id: 3,  timestamp: ts(12),   userId: 2, userName: 'Cajero Principal', action: 'SALE_CREATED',           module: 'POS',           description: 'Registró la venta FAC-000011 por ₡4,450',          severity: 'success' },
  { id: 4,  timestamp: ts(20),   userId: 2, userName: 'Cajero Principal', action: 'PRODUCT_ADDED_TO_CART',  module: 'POS',           description: 'Agregó Café 1820 250g al carrito',                 severity: 'info'    },
  { id: 5,  timestamp: ts(35),   userId: 1, userName: 'Administrador',    action: 'PRODUCT_DELETED',        module: 'Inventario',    description: 'Eliminó el producto Jabón IXI 125g',               severity: 'warning' },
  { id: 6,  timestamp: ts(60),   userId: 3, userName: 'María López',      action: 'LOGIN_SUCCESS',          module: 'Autenticación', description: 'Inicio de sesión exitoso',                         severity: 'success' },
  { id: 7,  timestamp: ts(75),   userId: 3, userName: 'María López',      action: 'SALE_CREATED',           module: 'POS',           description: 'Registró la venta FAC-000010 por ₡1,200',          severity: 'success' },
  { id: 8,  timestamp: ts(120),  userId: 2, userName: 'Cajero Principal', action: 'LOGIN_FAILED',           module: 'Autenticación', description: 'Intento de inicio de sesión fallido',              severity: 'error'   },
  { id: 9,  timestamp: ts(130),  userId: 2, userName: 'Cajero Principal', action: 'LOGIN_SUCCESS',          module: 'Autenticación', description: 'Inicio de sesión exitoso',                         severity: 'success' },
  { id: 10, timestamp: ts(180),  userId: 1, userName: 'Administrador',    action: 'PRODUCT_CREATED',        module: 'Inventario',    description: 'Creó el producto Chips Ruffles 43g',               severity: 'info'    },
  { id: 11, timestamp: ts(200),  userId: 1, userName: 'Administrador',    action: 'STOCK_UPDATED',          module: 'Inventario',    description: 'Actualizó stock de Doritos Nacho 55g a 3 unidades',severity: 'warning' },
  { id: 12, timestamp: ts(240),  userId: 2, userName: 'Cajero Principal', action: 'SALE_CANCELLED',         module: 'POS',           description: 'Canceló carrito de venta en progreso',             severity: 'warning' },
  { id: 13, timestamp: ts(300),  userId: 3, userName: 'María López',      action: 'LOGOUT',                 module: 'Autenticación', description: 'Cierre de sesión',                                 severity: 'info'    },
  { id: 14, timestamp: ts(360),  userId: 1, userName: 'Administrador',    action: 'REPORT_VIEWED',          module: 'Reportes',      description: 'Consultó reporte del período 01-08 al 16-08-2026', severity: 'info'    },
  { id: 15, timestamp: ts(380),  userId: 1, userName: 'Administrador',    action: 'REPORT_EXPORTED',        module: 'Reportes',      description: 'Exportó reporte de ventas a CSV',                  severity: 'info'    },
  { id: 16, timestamp: ts(480),  userId: 2, userName: 'Cajero Principal', action: 'UNAUTHORIZED_ACTION',    module: 'Seguridad',     description: 'Intentó acceder al módulo de Bitácora sin permisos', severity: 'error' },
  { id: 17, timestamp: ts(540),  userId: 1, userName: 'Administrador',    action: 'PRODUCT_UPDATED',        module: 'Inventario',    description: 'Actualizó precio de Aceite Coronado 1L a ₡1,400', severity: 'info'    },
  { id: 18, timestamp: ts(600),  userId: 3, userName: 'María López',      action: 'LOGIN_SUCCESS',          module: 'Autenticación', description: 'Inicio de sesión exitoso',                         severity: 'success' },
  { id: 19, timestamp: ts(660),  userId: 3, userName: 'María López',      action: 'SALE_CREATED',           module: 'POS',           description: 'Registró la venta FAC-000009 por ₡4,600',          severity: 'success' },
  { id: 20, timestamp: ts(720),  userId: 1, userName: 'Administrador',    action: 'PRODUCT_CREATED',        module: 'Inventario',    description: 'Creó el producto Atol de maíz 400g',               severity: 'info'    },
];
