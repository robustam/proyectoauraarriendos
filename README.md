# AuraArriendos 🏠

Sitio web de arriendo de casas y departamentos en Chile. Incluye un panel de administración para gestionar las propiedades, los usuarios, el blog y los mensajes.

Proyecto de la asignatura **DSY1104 — Desarrollo Fullstack I**, Escuela de Informática y Telecomunicaciones, **DUOC UC**.

---

## ✨ Funcionalidades

### Sitio público
- **Inicio**: portada con buscador, categorías, propiedades destacadas, testimonios y las últimas entradas del blog.
- **Propiedades**: listado con filtros por región, comuna, tipo de propiedad y precio.
- **Detalle de propiedad**: galería de fotos con miniaturas, características (dormitorios, baños, m², estacionamiento), aviso de últimas unidades y propiedades relacionadas.
- **Mis solicitudes**: el usuario puede guardar las propiedades que le interesan (♥).
- **Publicar arriendo**: formulario para que un arrendador publique su propiedad. Queda en estado *pendiente* hasta que un administrador la revisa.
- **Blog**: artículos con consejos para arrendar.
- **Nosotros** y **Contacto**. Los mensajes del formulario de contacto llegan al inbox del panel.
- **Registro e inicio de sesión**, con validación de RUN chileno, correo y contraseña.

### Panel de administración (`html/admin/`)
- **Dashboard** con resumen general.
- **Propiedades**: crear, editar, eliminar, aprobar o rechazar publicaciones (con motivo) y marcar como arrendada.
- **Usuarios**: CRUD de usuarios (solo Administrador).
- **Blog**: crear, editar y eliminar artículos (solo Administrador).
- **Inbox**: mensajes recibidos desde Contacto.

### Roles

| Rol | Acceso |
|---|---|
| **Administrador** | Todo el panel |
| **Vendedor** | Panel sin gestión de usuarios ni blog |
| **Cliente** | Sitio público, solicitudes y publicar arriendo |

---

## 🛠️ Tecnologías

- **HTML5**, **CSS3** y **JavaScript** vanilla (sin frameworks).
- **localStorage** como base de datos simulada, en lugar de un backend.
- **GSAP + ScrollTrigger** para animaciones (en `js/lib/`).
- **Google Fonts**: Fraunces e Inter.

---

## 📁 Estructura del proyecto

```
proyectoauraarriendos/
├── index.html          → redirige a html/index.html
├── css/
│   └── styles.css      → estilos de todo el sitio
├── html/
│   ├── index.html, propiedades.html, propiedad-detalle.html,
│   ├── publicar.html, solicitudes.html, blog.html, blog-detalle.html,
│   ├── nosotros.html, contacto.html, login.html, registro.html
│   └── admin/          → páginas del panel de administración
├── js/
│   ├── store.js        → capa de datos sobre localStorage (AuraStore)
│   ├── catalog.js      → listado, filtros y detalle de propiedades
│   ├── auth.js         → login, registro y sesión
│   ├── validators.js   → validaciones de formularios (RUN, correo, etc.)
│   ├── region-comuna.js→ selects dependientes de región y comuna
│   ├── main.js         → navegación, animaciones y avisos (toasts)
│   ├── admin-*.js      → lógica de cada página del panel
│   └── lib/
│       ├── manifest.js → datos iniciales (propiedades, usuarios, blog, regiones)
│       ├── gsap.min.js
│       └── ScrollTrigger.min.js
├── img/                → imágenes del sitio y logo
└── video/
```

---

## 🚀 Cómo ejecutarlo

No requiere instalación.

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/robustam/proyectoauraarriendos.git
   ```
2. Abre `index.html` en el navegador. Si usas **VS Code**, se recomienda la extensión **Live Server** (clic derecho → *Open with Live Server*).

La primera vez que se abre, el sitio carga los datos de ejemplo de `js/lib/manifest.js` en el localStorage del navegador.

> 💡 **Reiniciar los datos:** abre las herramientas del navegador (F12) → *Application* → *Local Storage*, borra las claves que empiezan con `aura_` y recarga la página.

---

## 🔑 Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duoc.cl` | `admin123` |
| Vendedor | `vendedor@gmail.com` | `vende123` |
| Cliente | `cliente@gmail.com` | `cliente123` |

Solo se aceptan correos `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`.

---

## 👥 Equipo

- Roberto Bustamante — [@robustam](https://github.com/robustam)
- Sebastian Reyes
- Renato Navarrete

---

## 📷 Créditos de imágenes

Las imágenes provienen de bancos de imágenes libres (Wikimedia Commons, Flickr, Rawpixel, entre otros). El detalle está en `img/credits.json`.
