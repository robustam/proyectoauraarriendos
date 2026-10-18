# Documento de cobertura de testing — AuraArriendos (Evaluación Parcial 2)

## 1. Objetivo

Validar que los componentes y la lógica del frontend en React funcionan como se espera, usando
**Jasmine** (para escribir las pruebas) y **Karma** (para ejecutarlas en Chrome), y medir qué parte
del código queda cubierta por esas pruebas.

## 2. Entorno de pruebas

| Herramienta | Para qué se usa |
|---|---|
| **Jasmine 4** (`jasmine-core`, `karma-jasmine`) | Estructura de las pruebas: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `spyOn`, `jasmine.createSpy`. |
| **Karma 6** (`karma`, `karma-chrome-launcher`) | Abre Chrome sin ventana (ChromeHeadless) y ejecuta las pruebas en un navegador real. |
| **Webpack 5 + Babel** (`karma-webpack`, `babel-loader`, `@babel/preset-react`) | Compila los archivos `.jsx` para que el navegador los entienda. |
| **Istanbul** (`babel-plugin-istanbul`, `karma-coverage`) | Mide la cobertura: qué líneas, funciones y ramas se ejecutaron durante las pruebas. |
| **Helper propio** `src/tests/utils/pantalla.jsx` | Dibuja componentes, busca textos y campos, y simula clics, escritura y envíos. |

Archivos de configuración: `karma.conf.cjs` (corredor) y `babel.config.cjs` (compilación + cobertura).

**Comandos:** `npm test` (una vez, con cobertura) · `npm run test:watch` (modo continuo).
**Informe:** `coverage/html/index.html` y el resumen que aparece en la terminal.

## 3. Estrategia

Se siguieron las categorías propuestas en el anexo de la evaluación:

1. **Renderizado:** el componente muestra los datos que recibe, y las listas dibujan todos sus elementos.
2. **Renderizado condicional:** los elementos aparecen u ocultan según el estado (por ejemplo, un error solo aparece si hay error).
3. **Props:** los componentes reciben y usan sus propiedades (por ejemplo, un botón recibe su etiqueta y su `onClick`).
4. **Estado:** el estado cambia correctamente (por ejemplo, un formulario al escribir).
5. **Eventos:** se simulan clics, escritura, envíos y teclas, y se verifica la reacción.
6. **Mocks:** se reemplazan dependencias con espías de Jasmine para controlar su respuesta y verificar cómo se usan.

Cada prueba es independiente: `beforeEach` reinicia los datos de ejemplo (`store.reiniciarDatos()`) y
`afterEach` desmonta lo dibujado (`limpiarPantalla()`).

## 4. Inventario de pruebas (15 archivos, 71 pruebas)

| # | Archivo | Qué cubre | Tipo | Pruebas |
|---|---|---|---|---|
| 1 | `validadores.spec.js` | RUT (módulo 11), correo con dominios permitidos, nombres, largos, números, tarjeta (Luhn), vencimiento, CVV | Lógica | 7 |
| 2 | `formato.spec.js` | Formato de precio, ofertas, precio final, filtros del catálogo (tipo, comuna, precio, palabra clave, orden) | Lógica | 8 |
| 3 | `store.spec.js` | CRUD de propiedades, solicitudes sin duplicados, persistencia en localStorage, stock al pagar, categorías en uso, stock crítico | Lógica + **mock** (`spyOn(Storage.prototype, "setItem")`) | 7 |
| 4 | `pagos.spec.js` | Pasarela simulada: aprueba, rechaza y monto inválido | Lógica | 3 |
| 5 | `PropertyCard.spec.jsx` | Muestra datos por props, precio tachado solo con oferta, corazón según `guardada`, clic llama `onToggleGuardar(id)` | Renderizado, condicional, props, eventos + **mock** (`jasmine.createSpy`) | 4 |
| 6 | `PropertyGrid.spec.jsx` | Una tarjeta por propiedad, mensaje vacío, mensaje personalizado, columnas responsivas de Bootstrap | Renderizado de listas, condicional | 4 |
| 7 | `FormField.spec.jsx` | El error solo aparece cuando hay error; clases `is-invalid` / `is-valid` | Condicional, props | 3 |
| 8 | `FavoritoButton.spec.jsx` | Etiqueta según props, ejecuta `onClick`, no lo ejecuta deshabilitado | Props, eventos + **mock** | 3 |
| 9 | `ConfirmDeleteModal.spec.jsx` | Solo se ve abierto, muestra título/mensaje, Eliminar → `onConfirm`, Cancelar/X/Escape → `onCancel` | Condicional, props, eventos + **mock** | 4 |
| 10 | `useForm.spec.jsx` | El estado cambia al escribir, validación en vivo, validación total al enviar | Estado | 3 |
| 11 | `Contacto.spec.jsx` | Contador de caracteres, errores al enviar vacío, dominio inválido, envío correcto guarda en el Inbox | Estado, condicional, eventos | 4 |
| 12 | `Login.spec.jsx` | Aviso condicional, clave incorrecta, validación de formato, admin → `/admin`, cliente → `?next=` | Condicional, eventos, navegación | 5 |
| 13 | `Header.spec.jsx` | Botones según sesión, botón Panel solo para staff, contador reactivo, menú desplegable y menú móvil | Condicional, estado, eventos | 6 |
| 14 | `Checkout.spec.jsx` | Redirección sin sesión, autocompletado de datos, pago aprobado, pago rechazado, tarjeta inválida | Flujo completo + **mock** (`spyOn(pagos, "procesarPago")`) | 5 |
| 15 | `AdminLayout.spec.jsx` | Sin sesión / cliente → login, agente sin secciones de admin, admin ve todo e Inbox, `RequireAdmin` | Condicional por rol, rutas protegidas | 5 |
| | | | **Total** | **71** |

### Cumplimiento de las tareas del anexo

| Tarea propuesta | Prueba que la cumple |
|---|---|
| Los componentes de lista renderizan todos los elementos | `PropertyGrid.spec.jsx` → "dibuja una tarjeta por cada propiedad" |
| Un mensaje de error solo se muestra cuando hay un error | `FormField.spec.jsx` → pruebas 1 y 2 · `Contacto.spec.jsx` |
| Un botón recibe la etiqueta y la función `onClick` | `FavoritoButton.spec.jsx` · `PropertyCard.spec.jsx` (prueba 4) |
| El estado de un formulario cambia al introducir texto | `useForm.spec.jsx` (prueba 1) · `Contacto.spec.jsx` (prueba 1) |
| Simular un clic y comprobar el cambio de estado o la llamada a una función | `Header.spec.jsx` (menús) · `ConfirmDeleteModal.spec.jsx` · `Checkout.spec.jsx` |

## 5. Uso de mocks

| Mock | Dónde | Para qué |
|---|---|---|
| `jasmine.createSpy("onToggleGuardar")` | PropertyCard | Reemplaza la función recibida por props y verifica que se llamó **una vez** y **con el id correcto**. |
| `jasmine.createSpy("onClick")` | FavoritoButton | Verifica cuántas veces se ejecutó el `onClick`, y que no se ejecute si el botón está deshabilitado. |
| `jasmine.createSpy` (×2) | ConfirmDeleteModal | Distingue entre confirmar y cancelar. |
| `spyOn(Storage.prototype, "setItem").and.callThrough()` | store | Espía la escritura en localStorage sin cambiar su comportamiento. |
| `spyOn(pagos, "procesarPago").and.returnValue(...)` | Checkout | Simula una pasarela que **aprueba** o **rechaza**; verifica que se cobre el monto correcto y que una tarjeta inválida **no** llegue a la pasarela. |

## 6. Resultados

### 6.1 Ejecución
Las 71 pruebas se ejecutaron con **Jasmine 4.6.1 en Chromium**: **71 de 71 aprobadas, 0 fallidas**.

### 6.2 Prueba de efectividad (mutaciones)
Para comprobar que las pruebas detectan errores reales, se introdujeron fallas a propósito en el código:

| Error introducido | Pruebas que fallaron |
|---|---|
| El corazón de la tarjeta deja de llamar a `onToggleGuardar` | 1 (PropertyCard, prueba de evento) |
| El precio de oferta deja de aplicarse (`precioFinal` devuelve siempre el precio normal) | 7 (formato, PropertyCard y Checkout) |

Al restaurar el código, las 71 pruebas volvieron a pasar.

### 6.3 Cobertura de código
Resultado de `npm test` (Jasmine 4 + Karma 6 en Chrome sin ventana, Node.js 24), 71 de 71 pruebas aprobadas:

| Métrica | Qué mide | Resultado |
|---|---|---|
| Statements (sentencias) | Instrucciones ejecutadas al menos una vez | **75,09 %** (564 de 751) |
| Branches (ramas if/else) | Caminos de las condiciones recorridos | **65,22 %** (422 de 647) |
| Functions (funciones) | Funciones llamadas al menos una vez | **72,72 %** (192 de 264) |
| Lines (líneas) | Líneas ejecutadas | **79,70 %** (483 de 606) |

**Lectura de los resultados:** 3 de cada 4 instrucciones del proyecto se ejecutan durante las pruebas.
La métrica más baja es *Branches* (65 %): hay condiciones cuyo camino alternativo no se prueba, sobre
todo en vistas del panel sin pruebas propias (Reportes, Visitas, Categorías) y en mensajes de error
poco frecuentes. Las capas con más riesgo para el usuario (validaciones, pagos, store y checkout)
son las mejor cubiertas.

**Corrección aplicada al entorno:** inicialmente Karma no encontraba los módulos `.js`
("Cannot find module '../services/store'") y solo se ejecutaban 22 de 71 pruebas. La causa era que
`package.json` declara `"type": "module"`, y en ese modo Webpack exige la extensión en cada import.
Se agregó `resolve: { fullySpecified: false }` a la regla de Babel en `karma.conf.cjs`, sin modificar
el código de la aplicación.

## 7. Análisis

- **Lo mejor cubierto** es la lógica de negocio (validaciones, filtros, ofertas, datos y pagos) y el
  flujo de compra completo, que son las partes donde un error afecta directamente al usuario o al dinero.
- **Los componentes reutilizables** (tarjeta, grilla, campo, botón, modal) se prueban aislados por props,
  así cada prueba verifica una sola responsabilidad.
- **Sin pruebas propias** quedan las vistas mayormente informativas (Nosotros, Blog) y algunas vistas
  del panel (Reportes, Categorías, Visitas). Su lógica de datos sí está cubierta por `store.spec.js`.
- **Próximos pasos:** agregar pruebas de `Registro`, `Publicar` y de los formularios del panel
  (PropiedadForm, UsuarioForm), y definir un mínimo de cobertura en Karma (`check` en `coverageReporter`).
