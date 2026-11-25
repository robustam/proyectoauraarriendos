# AuraArriendos — React + Bootstrap + Vitest

Tienda de arriendos de casas y departamentos (proyecto DSY1104).
Migrada de HTML/CSS/JS a **React 18 + Vite**, con **Bootstrap 5** para el diseño responsivo,
**React Router** para la navegación y **pruebas unitarias con Vitest** (reemplaza a Jasmine y Karma, que están descontinuados).

**EP3:** el frontend ahora consume la **API REST del backend** (Spring Boot + MySQL), repositorio
[`auraarriendos-backend`](https://github.com/robustam/auraarriendos-backend), con sesión **JWT** y permisos por rol.

---

## 0. Integración con el backend (EP3)

| Tema | Cómo funciona |
|---|---|
| Llamadas a la API | `src/services/api.js` usa `fetch`, agrega `Authorization: Bearer <token>` y convierte los errores del backend en mensajes |
| URL de la API | Variable `VITE_API_URL` (ver `.env.example`). Por defecto `http://localhost:8080/api/v1` |
| Datos | `src/services/store.js` guarda una **caché** que se llena desde la API (`sincronizar()`); crear, editar y eliminar llaman a la API |
| Login | `POST /auth/login` → token de acceso (15 min) y token de renovación (7 días) |
| Sesión al recargar | Al abrir la página se valida con `GET /auth/me`. Si el token de acceso venció, se **renueva solo** con `/auth/refresh` (rotación) |
| Cerrar sesión | Revoca el refresh token en el backend y borra tokens y datos privados del navegador |
| Seguridad | La contraseña nunca se guarda en el navegador. El menú oculta lo que el rol no puede usar, pero **quien decide es el backend** (401/403) |
| Pago | `POST /boletas`: el backend valida, calcula el total y genera la boleta (el frontend solo envía los ids) |

Solo quedan en el navegador (no forman parte del modelo de datos del backend): el carrito de solicitudes,
el blog, los mensajes de contacto y las visitas/entregas.

### Ejecutar con el backend

```bash
# 1. Backend (en la carpeta auraarriendos-backend, con MySQL encendido)
./mvnw spring-boot:run

# 2. Frontend (esta carpeta)
npm install
npm run dev          # http://localhost:5173
```

### Ejecutar todo con Docker (3 contenedores)

Desde la carpeta del backend: `docker compose up -d --build` → frontend en http://localhost:3000.
Este repositorio incluye su `Dockerfile` (compila con Node y sirve con **nginx:alpine**) y `nginx.conf`
(reenvía `/api` al contenedor del backend).

---

## 1. Requisitos

- **Node.js 18 o superior** (incluye `npm`). Comprobar con:
  ```bash
  node -v
  ```
  ```bash
  npm -v
  ```

---

## 2. Comandos (uno por uno)

> Todos se ejecutan en una terminal **dentro de la carpeta del proyecto**.

### Instalar todo de una vez
`package.json` ya lista todas las dependencias, así que basta con:
```bash
npm install
```

### O instalar cada paquete por separado (equivale a lo anterior)

Dependencias de la aplicación:
```bash
npm install react@18.3.1 react-dom@18.3.1
```
```bash
npm install react-router-dom@6
```
```bash
npm install bootstrap@5.3.3
```

Herramientas de desarrollo (Vite):
```bash
npm install -D vite@5 @vitejs/plugin-react@4
```

Herramientas de pruebas (Vitest):
```bash
npm install -D vitest@2 jsdom@25
```
```bash
npm install -D @vitest/coverage-v8@2 @vitest/ui@2
```
Vitest usa la misma configuración de Vite (`vite.config.js`, sección `test`): no necesita Webpack,
Babel ni un navegador instalado, porque simula el navegador con **jsdom**.

### Usar el proyecto

| Comando | Qué hace |
|---|---|
| `npm run dev` | Abre la app en modo desarrollo en http://localhost:5173 (se recarga sola al guardar). |
| `npm test` | Ejecuta **todas las pruebas** una vez con Vitest y genera la cobertura. |
| `npm run test:watch` | Deja las pruebas corriendo; se repiten cada vez que guardas un archivo. |
| `npm run test:ui` | Abre la interfaz visual de Vitest en el navegador (lista de pruebas y resultados). |
| `npm run build` | Genera la versión final optimizada en la carpeta `dist/`. |
| `npm run preview` | Sirve la carpeta `dist/` para revisarla antes de publicarla. |

```bash
npm run dev
```
```bash
npm test
```
```bash
npm run test:watch
```
```bash
npm run test:ui
```
```bash
npm run build
```
```bash
npm run preview
```

### Ver el informe de cobertura
Después de `npm test`, abre en el navegador el archivo:
```
coverage/index.html
```
En la terminal también aparece un resumen ("Statements", "Branches", "Functions", "Lines").

### Subir a GitHub (repositorio público)
```bash
git init
```
```bash
git add .
```
```bash
git commit -m "AuraArriendos en React + Bootstrap + pruebas Vitest"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/TU_USUARIO/aura-arriendos-react.git
```
```bash
git push -u origin main
```
(Crea primero el repositorio vacío y público en github.com y reemplaza `TU_USUARIO`.)

### Si algo falla
- **"vitest: command not found" o falta un módulo** → vuelve a ejecutar `npm install`.
- **La cobertura no alcanza el mínimo** → `npm test` termina con error y muestra qué métrica bajó
  (los mínimos están en `vite.config.js`, `test.coverage.thresholds`).
- **El puerto 5173 está ocupado** → `npm run dev -- --port 5174`.

---

## 3. Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@gmail.com | vende123 |
| Cliente | cliente@gmail.com | cliente123 |

**Tarjetas de prueba** (el pago lo simula el backend): aprobada `4242 4242 4242 4242`, rechazada `4000 0000 0000 0002`, con cualquier vencimiento futuro (MM/AA) y CVV de 3 dígitos.

---

## 4. Vistas

### Tienda (pública)
| Vista | Ruta |
|---|---|
| Inicio | `/` |
| Propiedades (catálogo con filtros y buscador) | `/propiedades` |
| Detalle de propiedad | `/propiedades/:id` |
| Categorías / una categoría | `/categorias` · `/categorias/:id` |
| Ofertas | `/ofertas` |
| Nosotros · Blog · Detalle blog · Contacto | `/nosotros` · `/blog` · `/blog/:id` · `/contacto` |
| Iniciar sesión · Registro | `/login` · `/registro` |
| Publicar arriendo | `/publicar` |
| Mis solicitudes (carrito) | `/solicitudes` |
| Checkout (pago de la reserva) | `/checkout` |
| Pago correcto · Pago con error | `/compra/exito/:id` · `/compra/error/:id` |

### Panel de administración
| Vista | Ruta | Rol |
|---|---|---|
| Dashboard | `/admin` | Admin |
| Órdenes / Mostrar boleta | `/admin/ordenes` · `/admin/ordenes/:id` | Admin y Vendedor |
| Propiedades / Mostrar / Nueva / Editar | `/admin/propiedades` · `/admin/propiedades/:id` · `…/nueva` · `…/:id/editar` | Ver: ambos · Aprobar/crear/editar/eliminar: Admin |
| Stock crítico | `/admin/stock-critico` | Admin |
| Categorías / Nueva / Editar | `/admin/categorias` · `…/nueva` · `…/:id/editar` | Admin |
| Usuarios / Mostrar (historial de compras) / Nuevo / Editar | `/admin/usuarios` · `…/:correo` · `…/nuevo` · `…/:correo/editar` | Admin |
| Visitas y entregas | `/admin/visitas` | Admin |
| Blog · Inbox | `/admin/blog` · `/admin/mensajes` | Admin |
| Reportes | `/admin/reportes` | Admin |
| Perfil | `/admin/perfil` | Admin |

El **Vendedor** solo ve en su menú *Propiedades* y *Órdenes* (listado y detalle, sin modificar).
Si escribe otra ruta del panel a mano, vuelve a Propiedades.

---

## 5. Estructura

```
mi-sitio-react/
├── public/                 → archivos estáticos públicos (fotos de propiedades y blog en public/img)
├── src/                    → código fuente de la aplicación
│   ├── assets/             → recursos locales importados en el código (fotos de portada y fondos)
│   ├── components/         → componentes reutilizables: Header, Footer, PropertyCard, PropertyGrid, FormField, Modal…
│   ├── pages/              → vistas de la tienda (y pages/admin/ para las del panel)
│   ├── hooks/              → custom hooks: useForm (formularios), useStore (datos reactivos), etc.
│   ├── context/            → estado global con Context API: ToastContext (notificaciones)
│   ├── services/           → datos y lógica sin interfaz: api.js (llamadas al backend con JWT), store.js (caché
│   │                         + CRUD vía API), manifest.js (datos de ejemplo para pruebas), validators.js, format.js
│   ├── styles/             → theme.css: colores y tipografía de la marca sobre Bootstrap
│   ├── App.jsx             → componente principal: define las rutas
│   └── main.jsx            → punto de entrada: monta React y carga Bootstrap, el tema, el router y los toasts
├── tests/                  → pruebas Vitest (*.spec.js / *.spec.jsx) + utils/pantalla.jsx
├── docs/                   → ERS v2 y documento de cobertura de testing
├── vite.config.js          → configuración de Vite y de Vitest (sección test)
├── .gitignore              → archivos ignorados por Git
├── package.json            → dependencias y scripts del proyecto
└── index.html              → plantilla HTML principal
```

## 6. Conceptos clave

- **Props y estado**: `PropertyCard` recibe todo por props (`propiedad`, `guardada`, `onToggleGuardar`);
  `useForm` guarda el estado de los formularios; `Header` maneja su propio estado (menús abiertos).
- **Datos en tiempo real**: `store.js` avisa cada cambio y `useStoreVersion` (con `useSyncExternalStore`)
  vuelve a dibujar lo necesario: el contador del carrito, el Inbox y las tablas se actualizan solos.
- **Bootstrap**: grilla (`row`, `col-md-6`, `row-cols-lg-3`), navbar plegable, cards, formularios con
  `is-invalid`, tablas responsivas, modales, toasts, alerts, badges, nav-pills y progress.
- **Pruebas**: 20 archivos y 97 pruebas en `tests/`, cada línea comentada. Ver `docs/cobertura-testing.md`.
