# AuraArriendos

Plataforma web de arriendo de casas y departamentos. Proyecto académico para la
asignatura DSY1104 (Evaluación 1 — 30%): tienda/plataforma desarrollada con
**HTML5, CSS3 y JavaScript vanilla**, sin frameworks ni paso de build.

## Cómo verlo localmente

No requiere `npm` ni instalación. Basta con servir la carpeta como sitio estático:

- Si tienes Python: `python -m http.server 8765` en la raíz del proyecto y abre `http://localhost:8765/` (redirige a `html/index.html`).
- Si no tienes Python (Windows): ejecuta `tools/static-server.ps1` con PowerShell:
  ```powershell
  powershell -ExecutionPolicy Bypass -File tools/static-server.ps1
  ```
  y abre `http://localhost:8765/`.
- También puedes abrir `html/index.html` directamente en el navegador (algunas
  funciones de `localStorage` se comportan mejor servidas por http que por `file://`).

## Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Agente Arriendo | agentearriendo@gmail.com | agente123 |
| Cliente | cliente@gmail.com | cliente123 |

## Estructura del proyecto

```
index.html          → punto de entrada: redirige a html/index.html
html/               → todas las páginas del sitio público
  index.html, propiedades.html, propiedad-detalle.html, registro.html, login.html,
  publicar.html, solicitudes.html, nosotros.html, blog.html, blog-detalle.html, contacto.html
  admin/            → panel protegido (Dashboard, Propiedades, Usuarios, Blog, Inbox)
css/styles.css      → hoja de estilos única
js/                 → lógica de cada página
  store.js          → capa de datos sobre localStorage (simula backend)
  validators.js     → validaciones reutilizables (incluye RUT chileno)
  lib/              → gsap, ScrollTrigger y manifest.js (datos semilla)
img/                → fotografías (créditos en img/credits.json)
video/              → reservado para videos del sitio
```

## Funciones del panel de administración

- **Blog** (`html/admin/blog.html`): crear, editar y eliminar publicaciones. Aparecen de inmediato en `blog.html`; la página principal muestra las 2 más recientes.
- **Inbox** (`html/admin/mensajes.html`): recibe los mensajes del formulario de contacto. Permite leerlos, marcarlos leídos/no leídos, responder por correo y eliminarlos. El menú muestra cuántos hay sin leer.
- **Propiedades arrendadas**: el administrador (en Propiedades) o el dueño (en "Mis publicaciones") puede marcar una propiedad como arrendada. Se oculta temporalmente del sitio público y se puede reactivar cuando vuelva a estar disponible.

## Roles del sistema

- **Administrador**: acceso total. Aprueba o rechaza publicaciones de arrendadores, administra usuarios, propiedades, blog e inbox.
- **Agente de Arriendo**: Solo puede visualizar el listado y el detalle de las propiedades en el panel. Además, puede aprobar o rechazar las publicaciones del cliente
- **Cliente**: navega la tienda, guarda propiedades en "Mis solicitudes" y puede publicar su propia propiedad (queda pendiente de revisión).

## Notas técnicas

- El "carrito de compras" exigido por la pauta se reinterpretó como **"Mis solicitudes de arriendo"**: un arreglo de IDs de propiedades persistido en `localStorage`, con la misma lógica de añadir/quitar/vaciar.
- Las regiones y comunas están en `js/lib/manifest.js`, listas para cascada Región → Comuna en todos los formularios.
- El panel de administración vive en `html/admin/` y usa las mismas propiedades/usuarios guardados en `localStorage` (no hay backend real; es la base para la futura entrega con base de datos).
