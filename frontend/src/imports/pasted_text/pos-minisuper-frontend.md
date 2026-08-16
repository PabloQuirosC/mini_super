# POS PARA MINISÚPER — FRONTEND COMPLETO CON LOGIN, BITÁCORA Y MOCK DATA

Actúa como un **desarrollador frontend senior especializado en React, Tailwind CSS y arquitectura de aplicaciones administrativas/POS**.

Quiero construir únicamente el **FRONTEND** de un sistema de punto de venta (POS) para un minisúper personal.

Por ahora **NO necesito backend, API ni base de datos real**. Todo debe funcionar con **mock data en JavaScript**, pero la arquitectura debe quedar preparada para posteriormente conectar una API/base de datos real sin tener que rehacer toda la aplicación.

---

## 1. STACK OBLIGATORIO

Utiliza:

* React + Vite
* JavaScript/JSX
* Tailwind CSS
* React Router DOM
* Recharts para gráficos
* Lucide React para iconos
* Context API o hooks personalizados para estados globales
* Mock data mediante archivos `.js`
* Componentes reutilizables
* Arquitectura modular por carpetas

No coloques toda la aplicación en un único archivo.

---

# 2. OBJETIVO GENERAL

Crear una aplicación POS administrativa moderna para un minisúper.

El sistema debe permitir:

* Iniciar sesión
* Controlar acceso según usuario/rol
* Registrar ventas
* Administrar productos e inventario
* Consultar reportes
* Consultar una bitácora de acciones
* Mostrar dashboard con métricas
* Cerrar sesión
* Registrar acciones importantes realizadas por los usuarios
* Mostrar confirmaciones, errores y mensajes mediante modales personalizados

La aplicación debe sentirse como un **sistema POS real**, aunque todos los datos sean simulados.

---

# 3. AUTENTICACIÓN / LOGIN

Crear una pantalla de Login antes de acceder al sistema.

## Login

Debe contener:

* Logo/nombre del minisúper
* Usuario o correo
* Contraseña
* Botón "Iniciar sesión"
* Opción para mostrar/ocultar contraseña
* Mensaje de error mediante `<Modal />`, nunca `alert()`
* Diseño moderno y responsive

### Usuarios mock

Crear varios usuarios de prueba, por ejemplo:

```js
const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Administrador",
    role: "admin"
  },
  {
    id: 2,
    username: "cajero",
    password: "cajero123",
    name: "Cajero Principal",
    role: "cashier"
  }
];
```

Las contraseñas son únicamente para efectos de demostración.

---

# 4. AUTENTICACIÓN GLOBAL

Crear un:

```jsx
<AuthContext />
```

o hook equivalente:

```js
useAuth()
```

Debe permitir:

* `login()`
* `logout()`
* `currentUser`
* `isAuthenticated`
* `hasRole()`

Guardar temporalmente la sesión en `localStorage` para que un refresh no cierre inmediatamente la sesión.

Crear rutas protegidas:

```jsx
<ProtectedRoute />
```

Si un usuario no está autenticado y trata de entrar directamente a:

* `/dashboard`
* `/pos`
* `/inventory`
* `/reports`
* `/audit-log`

debe ser redirigido al:

```text
/login
```

---

# 5. ROLES Y PERMISOS

Implementar como mínimo:

### ADMIN

Puede:

* Dashboard
* Facturación/POS
* Inventario
* Reportes
* Bitácora
* Crear productos
* Editar productos
* Eliminar productos
* Ver todos los movimientos
* Cerrar sesión

### CAJERO

Puede:

* Dashboard
* Facturación/POS
* Consultar inventario
* Ver reportes básicos si corresponde
* Cerrar sesión

No puede:

* Eliminar productos
* Modificar configuraciones sensibles
* Consultar determinadas acciones administrativas de la bitácora

Si intenta realizar una acción para la cual no tiene permisos:

```js
showModal({
  type: "error",
  title: "Acceso denegado",
  message: "No tienes permisos para realizar esta acción."
});
```

Nunca utilizar `alert()`.

---

# 6. REQUISITO CRÍTICO — SISTEMA DE MODALES

Está PROHIBIDO utilizar:

```js
alert()
confirm()
prompt()
```

del navegador.

Todo mensaje debe utilizar un sistema propio de modales.

Crear:

```jsx
<Modal />
```

y:

```js
useModal()
```

o:

```jsx
ModalProvider
```

Ejemplo de uso:

```js
showModal({
  type: "error",
  title: "Producto no encontrado",
  message: "No existe ningún producto con ese código."
});
```

Debe soportar:

### Variantes

* `success`
* `error`
* `warning`
* `confirm`

### Confirmación

Debe permitir:

```js
showModal({
  type: "confirm",
  title: "Eliminar producto",
  message: "¿Estás seguro de que deseas eliminar este producto?",
  onConfirm: () => {
    // eliminar producto
  }
});
```

Debe poder cerrarse:

* Con X
* Con botón Cancelar
* Con botón Aceptar
* Haciendo clic fuera del modal
* Opcionalmente con Escape

Agregar una animación sencilla de entrada/salida.

---

# 7. BITÁCORA / AUDITORÍA

Crear un módulo completo:

```text
/bitacora
```

La bitácora debe registrar las acciones importantes realizadas dentro del sistema.

Crear un servicio/hook:

```js
useAuditLog()
```

o:

```js
auditService.js
```

Por ahora almacenar los registros en mock data y/o `localStorage`.

Cada registro debe contener:

```js
{
  id: 1,
  timestamp: "2026-08-15T18:30:00",
  userId: 1,
  userName: "Administrador",
  action: "DELETE_PRODUCT",
  module: "Inventario",
  description: "Eliminó el producto Coca-Cola 600ml",
  severity: "warning"
}
```

## Acciones que deben registrarse

Como mínimo:

### Autenticación

* LOGIN_SUCCESS
* LOGIN_FAILED
* LOGOUT

### POS

* SALE_CREATED
* SALE_CANCELLED
* PRODUCT_ADDED_TO_CART
* PRODUCT_REMOVED_FROM_CART

### Inventario

* PRODUCT_CREATED
* PRODUCT_UPDATED
* PRODUCT_DELETED
* STOCK_UPDATED

### Reportes

* REPORT_VIEWED
* REPORT_EXPORTED

### Seguridad

* UNAUTHORIZED_ACTION

---

# 8. PANTALLA DE BITÁCORA

Crear una pantalla:

```text
/bitacora
```

con:

* Tabla de registros
* Fecha y hora
* Usuario
* Módulo
* Acción
* Descripción
* Nivel/severidad
* Badge visual

Agregar filtros:

* Por usuario
* Por módulo
* Por tipo de acción
* Por rango de fechas
* Búsqueda por texto

Agregar paginación mock si es necesario.

Ejemplo visual:

| Fecha            | Usuario | Módulo     | Acción          | Descripción             |
| ---------------- | ------- | ---------- | --------------- | ----------------------- |
| 15/08/2026 18:30 | Admin   | Inventario | PRODUCT_DELETED | Eliminó Coca-Cola 600ml |
| 15/08/2026 18:25 | Cajero  | POS        | SALE_CREATED    | Venta #00025            |
| 15/08/2026 18:20 | Admin   | Auth       | LOGIN_SUCCESS   | Inicio de sesión        |

---

# 9. DASHBOARD

Crear:

```text
/dashboard
```

Mostrar:

### Tarjetas superiores

* Ventas de hoy
* Número de facturas
* Comparación contra ayer
* Ganancia estimada
* Productos con stock bajo

Cada tarjeta debe mostrar:

* Icono
* Valor
* Comparación
* Indicador positivo/negativo

### Productos con stock bajo

Mostrar lista corta con:

* Producto
* Stock actual
* Stock mínimo
* Badge rojo/amarillo

### Top 5 productos vendidos

Mostrar:

* Producto
* Unidades vendidas
* Total generado

### Gráfico

Utilizar Recharts para mostrar ventas de los últimos 7 días.

---

# 10. FACTURACIÓN / POS

Ruta:

```text
/pos
```

Debe ser la pantalla principal para vender.

## Código de barras

Crear un input:

```text
Escanear código de barras...
```

Debe:

* Mantenerse enfocado
* Permitir escribir código manualmente
* Buscar producto al presionar Enter
* Agregar producto automáticamente al carrito
* Limpiar el input después de agregar

Si no encuentra el producto:

```js
showModal({
  type: "error",
  title: "Producto no encontrado",
  message: "No existe un producto con ese código de barras."
});
```

Después de cada operación, el foco debe regresar al input de escaneo.

---

# 11. BÚSQUEDA MANUAL

Agregar buscador por nombre.

Mientras el usuario escribe, mostrar resultados:

* Nombre
* Código
* Precio
* Stock

Al seleccionar un producto:

* Agregar al carrito
* Incrementar cantidad si ya existe

---

# 12. CARRITO

Tabla:

| Producto | Cantidad | Precio | Subtotal | Acción |
| -------- | -------: | -----: | -------: | ------ |

Cantidad:

* Botón `-`
* Cantidad actual
* Botón `+`

También permitir editar manualmente la cantidad.

Validar que:

```text
cantidad <= stock disponible
```

Si supera el stock:

mostrar modal de advertencia.

Eliminar producto:

```text
Eliminar
```

debe solicitar confirmación mediante modal.

---

# 13. TOTAL Y PAGO

Mostrar claramente:

* Subtotal
* Descuentos si se implementan
* Total

Métodos de pago:

* Efectivo
* SINPE
* Tarjeta

Para efectivo, permitir introducir:

```text
Monto recibido
```

y calcular:

```text
Cambio
```

El botón:

```text
COBRAR
```

debe:

1. Validar que exista al menos un producto
2. Validar método de pago
3. Registrar venta mock
4. Registrar acción en bitácora
5. Mostrar modal de éxito
6. Mostrar número de factura/venta
7. Limpiar carrito
8. Regresar foco al escáner

---

# 14. INVENTARIO

Ruta:

```text
/inventory
```

Tabla con:

* Código de barras
* Nombre
* Categoría
* Precio compra
* Precio venta
* Margen
* Stock
* Stock mínimo
* Estado
* Acciones

Estado:

### Stock normal

Badge verde.

### Stock bajo

Badge amarillo.

### Sin stock

Badge rojo.

---

# 15. CRUD DE PRODUCTOS

Crear un modal reutilizable:

```jsx
<ProductFormModal />
```

Debe servir tanto para:

```text
Agregar producto
```

como:

```text
Editar producto
```

Campos:

* Código de barras
* Nombre
* Categoría
* Precio de compra
* Precio de venta
* Stock
* Stock mínimo
* Estado

Validaciones:

* Campos obligatorios
* Precios mayores a 0
* Stock no negativo
* Código de barras único

Al crear:

```text
PRODUCT_CREATED
```

Al editar:

```text
PRODUCT_UPDATED
```

Al eliminar:

mostrar modal:

```text
¿Estás seguro de eliminar este producto?
```

Si confirma:

```text
PRODUCT_DELETED
```

Debe registrar la acción en la bitácora.

---

# 16. REPORTES

Ruta:

```text
/reports
```

Crear selector:

```text
Fecha inicial
Fecha final
```

Mostrar:

* Total vendido
* Número de ventas
* Ganancia estimada
* Ticket promedio

Tabla:

| Fecha | Factura | Usuario | Productos | Método de pago | Total |
| ----- | ------- | ------- | --------: | -------------- | ----: |

Agregar botón:

```text
Exportar a CSV
```

La exportación puede ser mock, pero preferiblemente genera un CSV real desde los datos actuales.

Registrar:

```text
REPORT_EXPORTED
```

en la bitácora.

---

# 17. LAYOUT PRINCIPAL

Después del login utilizar:

```text
<AppLayout />
```

Con:

### Sidebar fijo

Logo:

```text
MINISÚPER
POS
```

Menú:

* Dashboard
* Facturación
* Inventario
* Reportes
* Bitácora

Mostrar solamente las opciones permitidas según el rol.

### Parte inferior del sidebar

Mostrar:

* Avatar/iniciales
* Nombre del usuario
* Rol
* Botón "Cerrar sesión"

Cerrar sesión debe mostrar confirmación mediante modal.

---

# 18. HEADER

Crear:

```jsx
<Header />
```

Debe mostrar:

* Nombre del módulo actual
* Usuario actual
* Rol
* Indicador de sesión
* Acceso rápido al POS
* Botón de logout

---

# 19. RESPONSIVE

La interfaz debe funcionar correctamente en:

* Desktop
* Laptop
* Tablet

Prioridad:

```text
Desktop/Caja > Tablet > Mobile
```

En tablet:

* Sidebar puede convertirse en menú colapsable
* Tablas deben permitir scroll horizontal
* Los botones principales deben seguir siendo fáciles de utilizar

---

# 20. MOCK DATA

Crear al menos **20 productos realistas** de minisúper.

Categorías:

* Bebidas
* Snacks
* Lácteos
* Abarrotes
* Limpieza
* Higiene personal
* Enlatados
* Panadería

Ejemplos:

* Coca-Cola 600ml
* Pepsi 600ml
* Agua Cristal 1L
* Leche Dos Pinos 1L
* Arroz Tío Pelón 1kg
* Frijoles Ducal
* Atún Sardimar
* Galletas María
* Doritos
* Café 1820
* Azúcar 1kg
* Sal 500g
* Aceite 1L
* Papel higiénico
* Jabón de baño
* Detergente
* Pasta dental
* Pan cuadrado
* Huevos
* Atol

Cada producto debe contener:

```js
{
  id,
  barcode,
  name,
  category,
  purchasePrice,
  salePrice,
  stock,
  minStock
}
```

---

# 21. MOCK DATA ADICIONAL

Crear también:

```text
mockUsers.js
mockProducts.js
mockSales.js
mockAuditLogs.js
mockDashboard.js
```

No mezclar todos los datos en un único archivo.

---

# 22. ARQUITECTURA DE CARPETAS

Utiliza una estructura similar a:

```text
src/
├── assets/
│
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── EmptyState.jsx
│   │   └── Loading.jsx
│   │
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── dashboard/
│   ├── pos/
│   ├── inventory/
│   ├── reports/
│   └── audit/
│
├── context/
│   ├── AuthContext.jsx
│   ├── ModalContext.jsx
│   ├── CartContext.jsx
│   └── AuditContext.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useModal.js
│   ├── useCart.js
│   └── useAuditLog.js
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── POS.jsx
│   ├── Inventory.jsx
│   ├── Reports.jsx
│   └── AuditLog.jsx
│
├── data/
│   ├── mockUsers.js
│   ├── mockProducts.js
│   ├── mockSales.js
│   ├── mockAuditLogs.js
│   └── mockDashboard.js
│
├── services/
│   ├── authService.js
│   ├── productService.js
│   ├── salesService.js
│   └── auditService.js
│
├── utils/
│   ├── formatCurrency.js
│   ├── formatDate.js
│   ├── csvExport.js
│   └── permissions.js
│
├── App.jsx
├── main.jsx
└── index.css
```

La estructura puede modificarse si existe una alternativa mejor, pero debe mantenerse una clara separación de responsabilidades.

---

# 23. DISEÑO VISUAL

Utiliza un estilo:

* Moderno
* Limpio
* Profesional
* Administrativo
* Fácil de utilizar rápidamente en una caja

Paleta:

* Fondo gris muy claro
* Sidebar oscuro
* Blanco para tarjetas
* Color de acento verde/emerald, asociado a ventas y abarrotes
* Rojo para errores/stock agotado
* Amarillo para advertencias
* Verde para éxito

Utilizar:

* Bordes suaves
* `rounded-xl`
* Sombras ligeras
* Espaciado consistente
* Tipografía legible
* Iconos Lucide

Evitar un diseño excesivamente recargado.

---

# 24. COMPONENTES REUTILIZABLES

Crear componentes reutilizables para:

* Modal
* Botones
* Inputs
* Select
* Badges
* Cards
* Tablas
* Empty states
* Loading states
* Confirmaciones
* Search input
* Date range picker
* Stat cards
* Sidebar
* Header

No duplicar código innecesariamente.

---

# 25. ESTADO DE LA APLICACIÓN

Utilizar Context API para:

```text
AuthContext
ModalContext
CartContext
AuditContext
```

No es necesario Redux.

Mantener los estados claramente separados.

---

# 26. PERSISTENCIA MOCK

Para simular una aplicación más realista, utilizar `localStorage` para:

* Usuario autenticado
* Carrito actual
* Productos modificados
* Ventas
* Bitácora

Crear una pequeña capa de servicios para que posteriormente pueda sustituirse fácilmente por llamadas a una API.

Ejemplo:

```js
productService.getProducts()
productService.createProduct()
productService.updateProduct()
productService.deleteProduct()
```

Por ahora estas funciones trabajarán con mock data/localStorage.

---

# 27. SEGURIDAD FRONTEND

Aunque no existe backend todavía, estructurar el frontend pensando en seguridad:

* Rutas protegidas
* Control de permisos por rol
* No permitir acceso visual a módulos no autorizados
* Registrar intentos de acciones no permitidas
* Confirmar operaciones destructivas
* Cerrar sesión correctamente
* No almacenar información innecesaria del usuario

IMPORTANTE:

Dejar claro mediante comentarios que **la autorización real deberá validarse posteriormente en backend**. El control frontend es únicamente para UX y prototipo.

---

# 28. EXPERIENCIA DE USUARIO

Priorizar velocidad para el cajero.

En POS:

* El escáner debe estar siempre disponible
* Enter agrega productos
* Después de agregar producto el foco vuelve al escáner
* Cantidades fáciles de modificar
* Total grande y visible
* Botón COBRAR destacado
* Pocas interacciones innecesarias

Mostrar feedback visual después de operaciones.

Nunca utilizar:

```js
alert()
confirm()
prompt()
```

---

# 29. MANEJO DE ERRORES

Todos los errores deben manejarse mediante el sistema de modal.

Ejemplos:

```js
showModal({
  type: "error",
  title: "Error",
  message: "No se pudo guardar el producto."
});
```

```js
showModal({
  type: "warning",
  title: "Stock insuficiente",
  message: "No hay suficiente inventario para esta cantidad."
});
```

```js
showModal({
  type: "success",
  title: "Venta completada",
  message: "La venta #00025 fue registrada correctamente."
});
```

---

# 30. RUTAS

Crear como mínimo:

```text
/login
/dashboard
/pos
/inventory
/reports
/audit-log
```

La ruta `/` debe redirigir:

* A `/login` si no hay sesión
* A `/dashboard` si existe sesión

---

# 31. NAVEGACIÓN

La navegación debe funcionar correctamente con React Router.

No utilizar navegación manual mediante cambios arbitrarios de `window.location`.

---

# 32. FACTURAS MOCK

Crear números de venta consecutivos:

```text
FAC-000001
FAC-000002
FAC-000003
```

Cada venta debe guardar:

```js
{
  id,
  invoiceNumber,
  date,
  userId,
  userName,
  items,
  subtotal,
  total,
  paymentMethod
}
```

---

# 33. CRITERIOS DE CALIDAD

El código debe ser:

* Limpio
* Legible
* Modular
* Reutilizable
* Fácil de mantener
* Preparado para conectar backend posteriormente
* Sin duplicación innecesaria
* Con nombres descriptivos
* Con componentes pequeños y enfocados en una responsabilidad

No crear componentes gigantes.

---

# 34. ENTREGABLE FINAL

Genera el proyecto completo.

Incluye:

1. Estructura de carpetas
2. Instalación/configuración de dependencias
3. Configuración de Tailwind
4. Todos los componentes principales
5. Todas las páginas
6. Contextos
7. Hooks
8. Servicios mock
9. Datos mock
10. Sistema de autenticación
11. Sistema de permisos
12. Sistema de modales
13. Carrito POS
14. Inventario CRUD
15. Reportes
16. Exportación CSV
17. Bitácora/auditoría
18. React Router
19. Responsive design

El resultado debe poder ejecutarse inmediatamente con:

```bash
npm install
npm run dev
```

---

# 35. IMPORTANTE SOBRE EL CÓDIGO

No entregues solamente ejemplos parciales ni pseudocódigo.

Genera código funcional y coherente entre todos los archivos.

Si la respuesta es demasiado extensa para entregar todos los archivos de una sola vez, divide la implementación en fases, pero mantén la arquitectura consistente:

### Fase 1

Configuración + Login + Layout + Auth + Router

### Fase 2

Dashboard + componentes generales

### Fase 3

POS + carrito + pagos

### Fase 4

Inventario + CRUD

### Fase 5

Reportes + CSV

### Fase 6

Bitácora + permisos + auditoría

### Fase 7

Pulido visual + responsive + validaciones

En cada fase entrega código listo para integrarse con las fases anteriores.

**No uses `alert()`, `confirm()` ni `prompt()` bajo ninguna circunstancia.**
