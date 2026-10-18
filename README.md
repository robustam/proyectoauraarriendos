# AuraArriendos — React + Bootstrap + Jasmine/Karma

Tienda de arriendos de casas y departamentos (proyecto DSY1104, Evaluación Parcial 2).
Migrada de HTML/CSS/JS a **React 18 + Vite**, con **Bootstrap 5** para el diseño responsivo,
**React Router** para la navegación y **pruebas unitarias con Jasmine y Karma**.

---

## 1. Requisitos

- **Node.js 18 o superior** (incluye `npm`). Comprobar con:
  ```bash
  node -v
  ```
  ```bash
  npm -v
  ```
- **Google Chrome** instalado (Karma lo usa para correr las pruebas).

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

Herramientas de pruebas (Jasmine + Karma):
```bash
npm install -D jasmine-core@4 karma@6 karma-jasmine@5
```
```bash
npm install -D karma-chrome-launcher karma-jasmine-html-reporter
```
```bash
npm install -D karma-webpack@5 webpack@5 babel-loader@9
```
```bash
npm install -D @babel/core @babel/preset-env @babel/preset-react
```
```bash
npm install -D karma-coverage babel-plugin-istanbul
```

### Usar el proyecto

| Comando | Qué hace |
|---|---|
| `npm run dev` | Abre la app en modo desarrollo en http://localhost:5173 (se recarga sola al guardar). |
| `npm test` | Ejecuta **todas las pruebas** una vez en Chrome sin ventana y genera la cobertura. |
| `npm run test:watch` | Deja las pruebas corriendo; se repiten cada vez que guardas un archivo. |
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
npm run build
```
```bash
npm run preview
```

### Ver el informe de cobertura
Después de `npm test`, abre en el navegador el archivo:
```
coverage/html/index.html
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
git commit -m "AuraArriendos en React + Bootstrap + pruebas Jasmine/Karma"
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
- **"karma: command not found" o falta un módulo** → vuelve a ejecutar `npm install`.
- **"No binary for ChromeHeadless browser"** → instala Google Chrome, o indica dónde está:
  - Windows (PowerShell): `$env:CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"`
  - macOS / Linux: `export CHROME_BIN=/ruta/a/chrome`
- **El puerto 5173 está ocupado** → `npm run dev -- --port 5174`.

---

## 3. Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Agente | agentearriendo@gmail.com | agente123 |
| Cliente | cliente@gmail.com | cliente123 |

**Tarjetas de prueba** (el pago es simulado): aprobada `4242 4242 4242 4242`, rechazada `4000 0000 0000 0002`, con cualquier vencimiento futuro (MM/AA) y CVV de 3 dígitos.

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
| Dashboard | `/admin` | Admin y Agente |
| Órdenes / Mostrar boleta | `/admin/ordenes` · `/admin/ordenes/:id` | Admin y Agente |
| Propiedades / Mostrar / Nueva / Editar | `/admin/propiedades` · `/admin/propiedades/:id` · `…/nueva` · `…/:id/editar` | Ver: ambos · Crear/editar: Admin |
| Stock crítico | `/admin/stock-critico` | Admin y Agente |
| Categorías / Nueva / Editar | `/admin/categorias` · `…/nueva` · `…/:id/editar` | Admin |
| Usuarios / Mostrar (historial de compras) / Nuevo / Editar | `/admin/usuarios` · `…/:correo` · `…/nuevo` · `…/:correo/editar` | Admin |
| Visitas y entregas | `/admin/visitas` | Admin y Agente |
| Blog · Inbox | `/admin/blog` · `/admin/mensajes` | Admin |
| Reportes | `/admin/reportes` | Admin y Agente |
| Perfil | `/admin/perfil` | Admin y Agente |

---

## 5. Estructura

```
src/
  main.jsx                → arranque: Bootstrap + tema + router + notificaciones
  App.jsx                 → todas las rutas
  data/manifest.js        → datos semilla (propiedades, usuarios, categorías, órdenes…)
  services/store.js       → "base de datos" sobre localStorage con CRUD
  services/pagos.js       → pasarela de pago simulada
  utils/                  → validaciones, formatos, filtros
  hooks/                  → useForm (formularios), useStore (datos reactivos), etc.
  context/ToastContext    → notificaciones (Toast de Bootstrap)
  components/             → Header, Footer, PropertyCard, PropertyGrid, FormField, Modal…
  pages/                  → vistas de la tienda
  pages/admin/            → vistas del panel
  styles/theme.css        → colores y tipografía de la marca sobre Bootstrap
  tests/                  → pruebas Jasmine (*.spec.js / *.spec.jsx) + utils/pantalla.jsx
karma.conf.cjs            → configuración de Karma
babel.config.cjs          → Babel para las pruebas (JSX + cobertura)
docs/                     → ERS v2 y documento de cobertura de testing
```

## 6. Conceptos clave

- **Props y estado**: `PropertyCard` recibe todo por props (`propiedad`, `guardada`, `onToggleGuardar`);
  `useForm` guarda el estado de los formularios; `Header` maneja su propio estado (menús abiertos).
- **Datos en tiempo real**: `store.js` avisa cada cambio y `useStoreVersion` (con `useSyncExternalStore`)
  vuelve a dibujar lo necesario: el contador del carrito, el Inbox y las tablas se actualizan solos.
- **Bootstrap**: grilla (`row`, `col-md-6`, `row-cols-lg-3`), navbar plegable, cards, formularios con
  `is-invalid`, tablas responsivas, modales, toasts, alerts, badges, nav-pills y progress.
- **Pruebas**: 15 archivos y 71 pruebas en `src/tests`, cada línea comentada. Ver `docs/cobertura-testing.md`.
