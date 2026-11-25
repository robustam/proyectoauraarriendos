# Documento de cobertura de testing — AuraArriendos (Evaluación Parcial 3)

## 1. Objetivo

Validar que los componentes y la lógica del frontend en React funcionan como se espera, usando
**Vitest** (para escribir y ejecutar las pruebas), y medir qué parte del código queda cubierta por
esas pruebas.

> **Cambio respecto de la EP2:** las pruebas se ejecutaban con Jasmine y Karma. Como Karma está
> descontinuado, el profesor pidió usar **Vitest**. Las 118 pruebas se migraron sin cambiar lo que
> verifican: solo cambió la herramienta y la forma de crear los espías (mocks).

## 2. Entorno de pruebas

| Herramienta | Para qué se usa |
|---|---|
| **Vitest 2** (`vitest`) | Estructura de las pruebas (`describe`, `it`, `expect`, `beforeEach`, `afterEach`) y espías (`vi.fn()`, `vi.spyOn()`). Usa la misma configuración de Vite que la aplicación. |
| **jsdom** (`jsdom`) | Simula el navegador (document, window, localStorage) dentro de Node.js: no se necesita abrir Chrome. |
| **Cobertura V8** (`@vitest/coverage-v8`) | Mide qué líneas, funciones y ramas se ejecutaron durante las pruebas. |
| **Vitest UI** (`@vitest/ui`) | Interfaz visual opcional para ver las pruebas en el navegador (`npm run test:ui`). |
| **Helper propio** `tests/utils/pantalla.jsx` | Dibuja componentes, busca textos y campos, simula clics, escritura y envíos, y reemplaza la API por espías. |

Configuración: `vite.config.js`, sección `test` (entorno jsdom, `globals: true`, `restoreMocks: true`
y umbrales de cobertura). Ya no existen `karma.conf.cjs` ni `babel.config.cjs`.

**Comandos:** `npm test` (una vez, con cobertura) · `npm run test:watch` (modo continuo) · `npm run test:ui` (interfaz visual).
**Informe:** `coverage/index.html` y el resumen que aparece en la terminal.

### Equivalencias Jasmine → Vitest usadas en la migración

| Jasmine (antes) | Vitest (ahora) |
|---|---|
| `jasmine.createSpy("nombre")` | `vi.fn()` |
| `spyOn(objeto, "metodo")` | `vi.spyOn(objeto, "metodo")` |
| `.and.returnValue(valor)` | `.mockReturnValue(valor)` |
| `.and.callFake(fn)` | `.mockImplementation(fn)` |
| `.and.callThrough()` | (es el comportamiento por defecto de `vi.spyOn`) |
| `.calls.mostRecent().args` | `.mock.lastCall` |
| `.calls.allArgs()` / `.calls.count()` | `.mock.calls` / `.mock.calls.length` |
| `jasmine.objectContaining(...)` / `jasmine.anything()` | `expect.objectContaining(...)` / `expect.anything()` |
| Los espías se quitan solos al terminar cada prueba | `restoreMocks: true` en `vite.config.js` |

## 3. Estrategia

Se siguen las categorías propuestas en la pauta:

1. **Renderizado:** el componente muestra los datos que recibe, y las listas dibujan todos sus elementos.
2. **Renderizado condicional:** los elementos aparecen u ocultan según el estado o el rol del usuario.
3. **Props:** los componentes reciben y usan sus propiedades (por ejemplo, un botón recibe su etiqueta y su `onClick`).
4. **Estado:** el estado cambia correctamente (por ejemplo, un formulario al escribir).
5. **Eventos:** se simulan clics, escritura, envíos y teclas, y se verifica la reacción.
6. **Mocks:** se reemplazan dependencias con espías de Vitest. En la EP3 el más importante es el de la
   **API del backend**: en las pruebas no hay servidor, así que `api.get/post/put/patch/del` se reemplazan
   por espías que responden como lo haría el backend (o con un error 401, 403, 409, etc.).

Cada prueba es independiente: `beforeEach` reinicia los datos de ejemplo y los espías de la API
(`datosDeEjemplo()`), y `afterEach` desmonta lo dibujado (`limpiarPantalla()`).

## 4. Inventario de pruebas (21 archivos, 118 pruebas)

| # | Archivo | Qué cubre | Tipo | Pruebas |
|---|---|---|---|---|
| 1 | `validadores.spec.js` | RUN (módulo 11), correo con dominios permitidos, nombres, largos, números, tarjeta (Luhn), vencimiento, CVV | Lógica | 7 |
| 2 | `formato.spec.js` | Formato de precio, ofertas, precio final, filtros del catálogo (tipo, comuna, precio, palabra clave, orden) | Lógica | 8 |
| 3 | `api.spec.js` | Envía el token JWT, sin sesión no lo envía, errores del backend como mensaje, **renovación automática con 401**, borra tokens si la renovación falla, login sin renovación, servidor caído, respuesta 204 | Lógica + **mock** (`vi.spyOn(window, "fetch")`) | 8 |
| 4 | `store.spec.js` | CRUD de propiedades vía API, error del backend sin tocar la caché, moderación (PATCH), carrito en localStorage, pago de la reserva, sincronización según el rol, sesión al recargar (`/auth/me`), stock crítico, roles | Lógica + **mocks** de la API y de `localStorage` | 14 |
| 5 | `PropertyCard.spec.jsx` | Muestra datos por props, precio tachado solo con oferta, corazón según `guardada`, clic llama `onToggleGuardar(id)` | Renderizado, condicional, props, eventos + **mock** (`vi.fn()`) | 4 |
| 6 | `PropertyGrid.spec.jsx` | Una tarjeta por propiedad, mensaje vacío, mensaje personalizado, columnas responsivas de Bootstrap | Renderizado de listas, condicional | 4 |
| 7 | `FormField.spec.jsx` | El error solo aparece cuando hay error; clases `is-invalid` / `is-valid` | Condicional, props | 3 |
| 8 | `FavoritoButton.spec.jsx` | Etiqueta según props, ejecuta `onClick`, no lo ejecuta deshabilitado | Props, eventos + **mock** | 3 |
| 9 | `ConfirmDeleteModal.spec.jsx` | Solo se ve abierto, muestra título/mensaje, Eliminar → `onConfirm`, Cancelar/X/Escape → `onCancel` | Condicional, props, eventos + **mock** | 4 |
| 10 | `useForm.spec.jsx` | El estado cambia al escribir, validación en vivo, validación total al enviar | Estado | 3 |
| 11 | `Contacto.spec.jsx` | Contador de caracteres, errores al enviar vacío, dominio inválido, envío correcto guarda en el Inbox | Estado, condicional, eventos | 4 |
| 12 | `Login.spec.jsx` | Aviso condicional, clave incorrecta (401 del backend), validación de formato, admin y vendedor → panel con tokens guardados, cliente → `?next=` | Condicional, eventos, navegación + **mock** de la API | 6 |
| 13 | `Header.spec.jsx` | Botones según sesión, botón Panel solo para personal, contador reactivo, menú desplegable y menú móvil | Condicional, estado, eventos | 6 |
| 14 | `Checkout.spec.jsx` | Redirección sin sesión, autocompletado, pago aprobado (envía solo los ids, no el total), pago rechazado, error del backend, tarjeta inválida no llega al backend | Flujo completo + **mock** de `POST /boletas` | 6 |
| 15 | `AdminLayout.spec.jsx` | Sin sesión / cliente → login, **Vendedor solo ve Propiedades y Órdenes**, admin ve todo e Inbox, `RequireAdmin` devuelve al Vendedor, cerrar sesión borra tokens | Condicional por rol, rutas protegidas | 6 |
| 16 | `AdminPropiedades.spec.jsx` | Admin aprueba (PATCH), mensaje si el backend rechaza, Vendedor ve el listado sin botones de modificar | Condicional por rol + **mock** de la API | 3 |
| 17 | `Registro.spec.jsx` | Errores al enviar vacío, nombre sin números, correo y RUN repetidos, confirmación de contraseña, registro en el backend, mensaje 409 del backend | Estado, condicional, eventos + **mock** | 6 |
| 18 | `Publicar.spec.jsx` | Sin sesión pide ingresar, errores al enviar vacío, oferta menor al precio, publicación enviada al backend queda "pendiente", mensaje de error del backend, marcar como arrendada (PATCH) | Condicional, estado + **mock** | 6 |
| 19 | `Categorias.spec.jsx` | Listado con conteo, Eliminar deshabilitado si está en uso, eliminar con modal (DELETE), mensaje 409, nombre obligatorio y único, crear (POST), editar (PUT), id inexistente redirige | CRUD + **mock** de la API | 8 |
| 20 | `Reportes.spec.jsx` | `ingresosPorMes` (solo pagadas, cruce de año), indicadores (ingresos, tasa de aprobación) y caso sin órdenes | Lógica pura, renderizado | 4 |
| 21 | `Visitas.spec.jsx` | Mensaje vacío, pestañas que filtran, marcar visita realizada, confirmar entrega marca la propiedad arrendada (PATCH), eliminar con modal | Estado, eventos, regla de negocio | 5 |
| | | | **Total** | **118** |

## 5. Uso de mocks

| Mock | Dónde | Para qué |
|---|---|---|
| `vi.spyOn(api, "get" / "post" / "put" / "patch" / "del")` | `tests/utils/pantalla.jsx` (todas las vistas) | Reemplaza el backend: por defecto responde "sin servidor" y cada prueba define la respuesta que necesita (`mockReturnValue`, `mockImplementation`). |
| `vi.spyOn(window, "fetch")` | `api.spec.js` | Simula respuestas HTTP (200, 204, 401, 409, sin conexión) para probar el envío del token y la **renovación automática**. |
| `vi.fn()` | PropertyCard, FavoritoButton, ConfirmDeleteModal | Reemplaza las funciones recibidas por props y verifica cuántas veces y con qué datos se llamaron. |
| `vi.spyOn(Storage.prototype, "setItem")` | store | Espía la escritura en localStorage sin cambiar su comportamiento. |

## 6. Resultados

### 6.1 Ejecución
`npm test` (Vitest 2.1 con jsdom, Node.js 22): **21 archivos, 118 de 118 pruebas aprobadas, 0 fallidas**,
en unos 12 segundos.

### 6.2 Prueba de efectividad (mutaciones)
Para comprobar que las pruebas detectan errores reales, se introdujeron fallas a propósito en el código:

| Error introducido | Pruebas que fallaron |
|---|---|
| El precio de oferta deja de aplicarse (`precioFinal` devuelve siempre el precio normal) | 8 |
| `api.js` deja de enviar el header `Authorization` con el token | 2 |
| El menú del panel muestra todas las opciones también al Vendedor | 1 |

Al restaurar el código, las 118 pruebas volvieron a pasar.

### 6.3 Cobertura de código
Resultado de `npm test` con cobertura V8 (`@vitest/coverage-v8`):

| Métrica | Qué mide | Resultado |
|---|---|---|
| Statements (sentencias) | Instrucciones ejecutadas al menos una vez | **93,62 %** (2466 de 2634) |
| Branches (ramas if/else) | Caminos de las condiciones recorridos | **83,84 %** (711 de 848) |
| Functions (funciones) | Funciones llamadas al menos una vez | **80,59 %** (216 de 268) |
| Lines (líneas) | Líneas ejecutadas | **93,62 %** (2466 de 2634) |

**Nota sobre la comparación con la EP2:** Karma medía con Istanbul y Vitest mide con V8; cuentan las
sentencias de forma distinta, por eso los porcentajes no se comparan uno a uno. Con Karma, las mismas
118 pruebas daban 83,42 % de sentencias y 86,45 % de líneas.

**Umbral mínimo de cobertura:** `vite.config.js` define `test.coverage.thresholds` con
Statements 80 %, Branches 70 %, Functions 75 % y Lines 80 %. Si una modificación baja la cobertura
de esos valores, `npm test` termina con error, lo que evita que la cobertura retroceda sin que
nadie lo note.

## 7. Análisis

- **Lo mejor cubierto** es la lógica de negocio (validaciones, filtros, ofertas) y la comunicación con
  el backend (`api.js` y `store.js`): envío del token, renovación, errores y datos según el rol.
- **Los permisos por rol** se prueban en dos niveles: el menú y las rutas (`AdminLayout.spec.jsx`) y
  los botones de cada pantalla (`AdminPropiedades.spec.jsx`). En el backend, la seguridad real se prueba
  aparte con `SeguridadIntegrationTest` (JUnit).
- **Los componentes reutilizables** (tarjeta, grilla, campo, botón, modal) se prueban aislados por props,
  así cada prueba verifica una sola responsabilidad.
- **Sin pruebas propias** quedan las vistas mayormente informativas (Nosotros, Blog) y los formularios
  del panel de propiedades y usuarios. Su lógica de datos sí está cubierta por `store.spec.js`.
- **Próximos pasos:** agregar pruebas de `PropiedadForm` y `UsuarioForm`, y subir gradualmente los
  umbrales de cobertura de `vite.config.js` a medida que aumenten las pruebas.
