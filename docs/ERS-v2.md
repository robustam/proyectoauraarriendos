# Especificación de Requisitos de Software (ERS) — Versión 2

**Proyecto:** AuraArriendos — plataforma de arriendo de casas y departamentos
**Asignatura:** DSY1104 Desarrollo Fullstack II — Evaluación Parcial 2
**Equipo:** Roberto Bustamante · Sebastian Reyes · Renato Navarrete
**Versión:** 2.0 (actualiza la versión 1 de la Evaluación Parcial 1)

> Nota para el equipo: si la ERS v1 tenía secciones propias (portada, firmas, historial), se mantienen
> y se reemplazan o agregan las secciones de este documento.

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requisitos de la versión 2 de AuraArriendos: la migración del sitio
HTML/CSS/JS a **React**, el diseño responsivo con **Bootstrap**, las vistas nuevas de la tienda y del
panel de administración, y el proceso de pruebas unitarias con **Jasmine y Karma**.

### 1.2 Alcance
AuraArriendos permite buscar, guardar y **reservar** propiedades en arriendo pagando el primer mes,
publicar propiedades para que sean revisadas, y administrar el catálogo, los usuarios, las órdenes y
los contenidos desde un panel con roles. En esta etapa los datos se guardan en el navegador
(localStorage), simulando una base de datos; el pago es simulado.

### 1.3 Definiciones
| Término | Significado |
|---|---|
| Propiedad (producto) | Casa o departamento publicado para arriendo. |
| Mis solicitudes (carrito) | Lista de propiedades que el cliente guarda antes de reservar. |
| Reserva / Orden / Boleta | Pago del primer mes de una o más propiedades; queda como orden "pagada" o "rechazada". |
| Stock | Unidades disponibles de una propiedad. Cada reserva pagada descuenta una. |
| Stock crítico | Umbral bajo el cual una propiedad aparece en el listado de críticos. |
| Oferta | Precio rebajado opcional, menor al precio normal. |
| SPA | Aplicación de una sola página: React cambia la vista sin recargar el sitio. |

### 1.4 Referencias
Instrucciones de la Evaluación Parcial 2 (Anexo 1) y pauta de evaluación DSY1104.

---

## 2. Descripción general

### 2.1 Perspectiva del producto
Aplicación web frontend construida con React 18 + Vite, React Router 6 y Bootstrap 5. Una capa de
datos en JavaScript (`services/store.js`) ofrece operaciones CRUD sobre localStorage y notifica a la
interfaz cada cambio, de modo que las vistas se actualizan en tiempo real. Queda preparada para
reemplazar esa capa por una API con base de datos en la siguiente entrega.

### 2.2 Usuarios y roles
| Rol | Puede |
|---|---|
| Visitante | Navegar el catálogo, categorías, ofertas, blog; contactar; registrarse. |
| Cliente | Lo anterior + guardar solicitudes, reservar y pagar, publicar su propiedad y marcarla arrendada. |
| Agente | Entrar al panel: ver propiedades, aprobar/rechazar publicaciones, marcar arrendadas, gestionar visitas y entregas, ver órdenes, stock crítico, reportes y su perfil. |
| Administrador | Todo lo del Agente + crear/editar/eliminar propiedades, categorías, usuarios, blog e Inbox. |

### 2.3 Restricciones
- Frontend sin backend: persistencia en localStorage del navegador.
- Correos válidos solo de los dominios `duoc.cl`, `profesor.duoc.cl` y `gmail.com` (regla de la pauta).
- RUN chileno validado con módulo 11, sin puntos ni guion.
- Debe funcionar en celular, tablet y escritorio (Bootstrap).

### 2.4 Supuestos
- El navegador tiene JavaScript y localStorage habilitados.
- El pago con tarjeta es una simulación para fines académicos (no se cobra dinero).

---

## 3. Requisitos funcionales

### 3.1 Tienda
| ID | Requisito | Vista |
|---|---|---|
| RF-01 | Mostrar inicio con buscador, categorías, destacadas, testimonios y blog. | `/` |
| RF-02 | Listar propiedades publicadas con filtros por región, comuna, tipo, precio máximo, palabra clave y orden; los filtros quedan en la URL. | `/propiedades` |
| RF-03 | Buscar desde la barra de navegación por texto libre. | Header |
| RF-04 | Mostrar el detalle de una propiedad con galería, características, stock y relacionadas. | `/propiedades/:id` |
| RF-05 | Mostrar las categorías y las propiedades de cada una. | `/categorias`, `/categorias/:id` |
| RF-06 | Mostrar las propiedades en oferta con su descuento. | `/ofertas` |
| RF-07 | Registrar usuarios con validación de RUN, nombre, apellidos, correo, región/comuna, dirección y contraseña. | `/registro` |
| RF-08 | Iniciar y cerrar sesión; el staff entra al panel y el cliente vuelve a la página de origen. | `/login` |
| RF-09 | Guardar y quitar propiedades en "Mis solicitudes" (requiere sesión), con contador y total en la barra. | `/solicitudes` |
| RF-10 | Checkout: datos del cliente (autocompletados con la sesión), domicilio, fecha de inicio y tarjeta. | `/checkout` |
| RF-11 | Procesar el pago: aprobado → orden pagada, baja el stock y se vacían las solicitudes pagadas; rechazado → orden rechazada con motivo y opción de reintentar. | `/compra/exito/:id`, `/compra/error/:id` |
| RF-12 | Mostrar la boleta con opciones de imprimir y enviar por correo. | `/compra/exito/:id` |
| RF-13 | Publicar una propiedad (queda pendiente) y ver el estado de "Mis publicaciones". | `/publicar` |
| RF-14 | Enviar un mensaje de contacto que llega al Inbox. | `/contacto` |
| RF-15 | Leer el blog y sus artículos. | `/blog`, `/blog/:id` |

### 3.2 Panel de administración
| ID | Requisito | Vista |
|---|---|---|
| RF-16 | Proteger el panel: solo Administrador y Agente; secciones exclusivas del Administrador. | `/admin/*` |
| RF-17 | Dashboard con métricas (reservas, ingresos, propiedades, usuarios) y accesos a cada módulo. | `/admin` |
| RF-18 | Listar órdenes (filtro y búsqueda) y mostrar la boleta. | `/admin/ordenes`, `/admin/ordenes/:id` |
| RF-19 | CRUD de propiedades con aprobación/rechazo (con motivo), marcar arrendada, ofertas y stock. | `/admin/propiedades…` |
| RF-20 | Mostrar una propiedad con su ficha completa y las órdenes donde aparece. | `/admin/propiedades/:id` |
| RF-21 | Listar las propiedades en stock crítico. | `/admin/stock-critico` |
| RF-22 | CRUD de categorías; no se elimina una categoría en uso; renombrar actualiza sus propiedades. | `/admin/categorias…` |
| RF-23 | CRUD de usuarios y vista de usuario con historial de compras. | `/admin/usuarios…` |
| RF-24 | Agendar visitas y registrar entregas; confirmar una entrega marca la propiedad arrendada. | `/admin/visitas…` |
| RF-25 | CRUD del blog e Inbox de mensajes (leer, marcar, responder, eliminar). | `/admin/blog…`, `/admin/mensajes` |
| RF-26 | Reportes: ingresos por mes, tasa de aprobación, ticket promedio y distribución del catálogo. | `/admin/reportes` |
| RF-27 | Perfil: editar los datos propios y la contraseña. | `/admin/perfil` |

## 4. Requisitos no funcionales
| ID | Requisito |
|---|---|
| RNF-01 | **Responsivo** con Bootstrap 5: grilla de 12 columnas, navbar plegable, tablas con scroll horizontal; sin desplazamiento lateral en pantallas de 390 px. |
| RNF-02 | **Usabilidad:** validación en tiempo real con mensajes claros bajo cada campo (`is-invalid` / `is-valid`) y notificaciones (toasts). |
| RNF-03 | **Accesibilidad:** etiquetas asociadas a cada campo, `aria-invalid`, `aria-expanded`, enlace "Saltar al contenido", respeta "reducir movimiento". |
| RNF-04 | **Mantenibilidad:** componentes con responsabilidad única que reciben datos por props; lógica separada en `services/` (datos, validaciones y formatos) y `hooks/`. |
| RNF-05 | **Calidad:** pruebas unitarias con Jasmine + Karma (97 pruebas) e informe de cobertura con Istanbul. |
| RNF-06 | **Seguridad básica:** rutas del panel protegidas por rol; la redirección `?next=` solo acepta rutas internas; de la tarjeta solo se guardan los últimos 4 dígitos. |
| RNF-07 | **Rendimiento:** imágenes con carga diferida y fotos subidas comprimidas a máx. 1200 px. |

## 5. Herramientas
| Área | Herramienta |
|---|---|
| Framework | React 18, React Router 6 |
| Construcción | Vite 5 |
| Estilos | Bootstrap 5.3 + tema propio (`theme.css`) |
| Pruebas | Jasmine 4, Karma 6, Webpack 5, Babel, Istanbul (karma-coverage) |
| Control de versiones | Git + GitHub (repositorio público) |
| Editor | Visual Studio Code |

## 6. Propuesta personalizada (adaptación del template a arriendos)
El template de la evaluación es una tienda de videojuegos con carrito y compra. En AuraArriendos:

| Template | AuraArriendos |
|---|---|
| Producto | Propiedad en arriendo |
| Carrito | Mis solicitudes |
| Compra | Reserva: se paga el primer mes de cada propiedad |
| Dirección de entrega | Domicilio de contacto + fecha de inicio del arriendo |
| Stock | Unidades disponibles (departamentos iguales en un edificio, por ejemplo) |
| Órdenes / boletas | Reservas pagadas y rechazadas |
| Extras propios | Publicación por arrendadores con aprobación, visitas y entregas, propiedades arrendadas ocultas, blog e Inbox |

## 7. Modelo de datos (localStorage)
| Clave | Contenido |
|---|---|
| `aura_propiedades` | id, código, nombre, categoría, región, comuna, dirección, precio, precioOferta, dormitorios, baños, m², estacionamiento, unidadesDisponibles, alertaDisponibilidad, imágenes, descripción, estado, destacada, arrendada, publicadoPor |
| `aura_categorias` | id, nombre, descripción, imagen |
| `aura_usuarios` | run, nombre, apellidos, correo, clave, fechaNacimiento, tipoUsuario, región, comuna, dirección |
| `aura_ordenes` | id, número, fecha, estado, cliente, dirección, fechaInicio, tarjeta (últimos 4), ítems, total, código de autorización o motivo de rechazo |
| `aura_solicitudes` | lista de ids de propiedades guardadas |
| `aura_sesion` | correo, nombre y rol del usuario conectado |
| `aura_blog`, `aura_mensajes`, `aura_tramites` | artículos, mensajes de contacto, visitas y entregas |
