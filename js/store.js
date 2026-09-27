/* AuraArriendos — capa de datos sobre localStorage.
   Simula el backend: siembra los arreglos de js/lib/manifest.js la primera vez
   que se visita el sitio y luego expone operaciones CRUD sobre localStorage.
   window.AuraStore es la única API pública de este archivo. */
   
(function () {
  "use strict";

  var KEYS = {
    propiedades: "aura_propiedades",
    usuarios: "aura_usuarios",
    sesion: "aura_sesion",
    solicitudes: "aura_solicitudes",
    blog: "aura_blog",
    mensajes: "aura_mensajes",
    tramites: "aura_tramites",
    seed: "aura_seed_v3",
    migracion: "aura_migracion_v3"
  };

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[AuraStore] lectura falló para " + key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("[AuraStore] escritura falló para " + key, e);
      return false;
    }
  }

  function seedIfNeeded() {
    var data = window.__AURA__ || {};
    if (readJSON(KEYS.seed, false) !== true) {
      writeJSON(KEYS.propiedades, data.propiedades || []);
      writeJSON(KEYS.usuarios, data.usuarios || []);
      writeJSON(KEYS.solicitudes, []);
      writeJSON(KEYS.seed, true);
    }
    if (readJSON(KEYS.blog, null) === null) writeJSON(KEYS.blog, data.blog || []);
    if (readJSON(KEYS.mensajes, null) === null) writeJSON(KEYS.mensajes, []);
    if (readJSON(KEYS.tramites, null) === null) writeJSON(KEYS.tramites, []);
  }

  /* Corrección de rutas y normalización del arreglo de imágenes */
  function migrarDatos() {
    var props = readJSON(KEYS.propiedades, []);
    var dataManifest = (window.__AURA__ && window.__AURA__.propiedades) || [];
    var modificado = false;

    props.forEach(function (p) {
      // 1. Corregir rutas antiguas
      if (typeof p.imagen === "string" && p.imagen.indexOf("assets/img/") === 0) {
        p.imagen = "../img/" + p.imagen.slice(11);
        modificado = true;
      }

      // 2. Si no tiene 'imagenes' o está vacío, busca en el manifest o crea el arreglo
      if (!p.imagenes || !Array.isArray(p.imagenes) || p.imagenes.length === 0) {
        var coincidencia = dataManifest.find(function (m) { return m.id === p.id; });
        if (coincidencia && coincidencia.imagenes && coincidencia.imagenes.length > 0) {
          p.imagenes = coincidencia.imagenes;
        } else {
          p.imagenes = p.imagen ? [p.imagen] : [];
        }
        modificado = true;
      }
    });

    if (modificado) {
      writeJSON(KEYS.propiedades, props);
    }

    var posts = readJSON(KEYS.blog, []);
    posts.forEach(function (b) {
      if (typeof b.imagen === "string" && b.imagen.indexOf("assets/img/") === 0) {
        b.imagen = "../img/" + b.imagen.slice(11);
      }
    });
    writeJSON(KEYS.blog, posts);
  }

  seedIfNeeded();
  migrarDatos();

  /* ---------- Propiedades ---------- */

  function getPropiedades() {
    return readJSON(KEYS.propiedades, []);
  }

  function getPropiedadPorId(id) {
    var lista = getPropiedades();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  function guardarPropiedad(propiedad) {
    var lista = getPropiedades();
    var idx = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === propiedad.id) { idx = i; break; }
    }
    
    // Asegura que siempre se guarde el arreglo 'imagenes'
    if (!propiedad.imagenes || !Array.isArray(propiedad.imagenes)) {
      propiedad.imagenes = propiedad.imagen ? [propiedad.imagen] : [];
    }

    if (idx >= 0) {
      lista[idx] = propiedad;
    } else {
      lista.push(propiedad);
    }
    writeJSON(KEYS.propiedades, lista);
    return propiedad;
  }

  function eliminarPropiedad(id) {
    var lista = getPropiedades().filter(function (p) { return p.id !== id; });
    writeJSON(KEYS.propiedades, lista);
  }

  function nuevoIdPropiedad() {
    var lista = getPropiedades();
    var max = 1000;
    lista.forEach(function (p) {
      var n = parseInt(String(p.id).replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return "PR-" + (max + 1);
  }

  function marcarArrendada(id, arrendada) {
    var p = getPropiedadPorId(id);
    if (!p) return null;
    p.arrendada = !!arrendada;
    if (arrendada) {
      p.fechaArrendada = new Date().toISOString();
    } else {
      delete p.fechaArrendada;
    }
    return guardarPropiedad(p);
  }

  function esVisiblePublico(p) {
    return !!p && p.estado === "publicada" && !p.arrendada;
  }

  /* ---------- Usuarios ---------- */

  function getUsuarios() {
    return readJSON(KEYS.usuarios, []);
  }

  function getUsuarioPorCorreo(correo) {
    var lista = getUsuarios();
    var buscado = String(correo || "").toLowerCase();
    for (var i = 0; i < lista.length; i++) {
      if (String(lista[i].correo).toLowerCase() === buscado) return lista[i];
    }
    return null;
  }

  function getUsuarioPorRun(run) {
    var lista = getUsuarios();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].run === run) return lista[i];
    }
    return null;
  }

  function guardarUsuario(usuario, correoOriginal) {
    var lista = getUsuarios();
    var idx = -1;
    var clave = String(correoOriginal || usuario.correo).toLowerCase();
    for (var i = 0; i < lista.length; i++) {
      if (String(lista[i].correo).toLowerCase() === clave) { idx = i; break; }
    }
    if (idx >= 0) {
      lista[idx] = usuario;
    } else {
      lista.push(usuario);
    }
    writeJSON(KEYS.usuarios, lista);
    return usuario;
  }

  function eliminarUsuario(correo) {
    var buscado = String(correo || "").toLowerCase();
    var lista = getUsuarios().filter(function (u) { return String(u.correo).toLowerCase() !== buscado; });
    writeJSON(KEYS.usuarios, lista);
  }

  /* ---------- Sesión ---------- */

  function iniciarSesion(usuario) {
    writeJSON(KEYS.sesion, {
      correo: usuario.correo,
      nombre: usuario.nombre,
      tipoUsuario: usuario.tipoUsuario
    });
  }

  function cerrarSesion() {
    try { window.localStorage.removeItem(KEYS.sesion); } catch (e) { /* noop */ }
  }

  function getSesion() {
    return readJSON(KEYS.sesion, null);
  }

  /* ---------- Solicitudes de arriendo ---------- */

  function getSolicitudes() {
    return readJSON(KEYS.solicitudes, []);
  }

  function estaEnSolicitudes(id) {
    return getSolicitudes().indexOf(id) !== -1;
  }

  function agregarSolicitud(id) {
    var lista = getSolicitudes();
    if (lista.indexOf(id) === -1) {
      lista.push(id);
      writeJSON(KEYS.solicitudes, lista);
    }
    return lista;
  }

  function quitarSolicitud(id) {
    var lista = getSolicitudes().filter(function (x) { return x !== id; });
    writeJSON(KEYS.solicitudes, lista);
    return lista;
  }

  function vaciarSolicitudes() {
    writeJSON(KEYS.solicitudes, []);
  }

  /* ---------- Blog ---------- */

  function getBlog() {
    return readJSON(KEYS.blog, []).slice().sort(function (a, b) {
      return String(b.fecha).localeCompare(String(a.fecha));
    });
  }

  function getPostPorId(id) {
    var lista = readJSON(KEYS.blog, []);
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  function guardarPost(post) {
    var lista = readJSON(KEYS.blog, []);
    var idx = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === post.id) { idx = i; break; }
    }
    if (idx >= 0) {
      lista[idx] = post;
    } else {
      lista.push(post);
    }
    var ok = writeJSON(KEYS.blog, lista);
    return ok ? post : null;
  }

  function eliminarPost(id) {
    var lista = readJSON(KEYS.blog, []).filter(function (b) { return b.id !== id; });
    writeJSON(KEYS.blog, lista);
  }

  function nuevoIdPost(titulo) {
    var base = String(titulo || "publicacion")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "publicacion";
    var id = base;
    var n = 2;
    while (getPostPorId(id)) { id = base + "-" + n; n++; }
    return id;
  }

  /* ---------- Mensajes ---------- */

  function getMensajes() {
    return readJSON(KEYS.mensajes, []).slice().sort(function (a, b) {
      return String(b.fecha).localeCompare(String(a.fecha));
    });
  }

  function guardarMensaje(datos) {
    var lista = readJSON(KEYS.mensajes, []);
    var mensaje = {
      id: "MSG-" + Date.now(),
      nombre: datos.nombre,
      correo: datos.correo,
      comentario: datos.comentario,
      fecha: new Date().toISOString(),
      leido: false
    };
    lista.push(mensaje);
    writeJSON(KEYS.mensajes, lista);
    return mensaje;
  }

  function marcarMensajeLeido(id, leido) {
    var lista = readJSON(KEYS.mensajes, []);
    lista.forEach(function (m) { if (m.id === id) m.leido = !!leido; });
    writeJSON(KEYS.mensajes, lista);
  }

  function eliminarMensaje(id) {
    var lista = readJSON(KEYS.mensajes, []).filter(function (m) { return m.id !== id; });
    writeJSON(KEYS.mensajes, lista);
  }

  function contarMensajesNoLeidos() {
    return readJSON(KEYS.mensajes, []).filter(function (m) { return !m.leido; }).length;
  }

  /* ---------- Trámites: visitas a la propiedad y entregas al cierre del
     arriendo. Gestionados por Administrador y Agente. Al confirmar una
     entrega ("Entregado") la propiedad se marca arrendada automáticamente. */

  function getTramites() {
    return readJSON(KEYS.tramites, []).slice().sort(function (a, b) {
      return String(b.fecha || "").localeCompare(String(a.fecha || ""));
    });
  }

  function getTramitePorId(id) {
    var lista = readJSON(KEYS.tramites, []);
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  function guardarTramite(tramite) {
    var lista = readJSON(KEYS.tramites, []);
    var idx = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === tramite.id) { idx = i; break; }
    }
    if (idx >= 0) {
      lista[idx] = tramite;
    } else {
      lista.push(tramite);
    }
    writeJSON(KEYS.tramites, lista);
    if (tramite.tipo === "entrega") {
      marcarArrendada(tramite.propiedadId, tramite.estado === "Entregado");
    }
    return tramite;
  }

  function eliminarTramite(id) {
    var lista = readJSON(KEYS.tramites, []).filter(function (t) { return t.id !== id; });
    writeJSON(KEYS.tramites, lista);
  }

  function nuevoIdTramite() {
    return "TR-" + Date.now();
  }

  window.AuraStore = {
    getPropiedades: getPropiedades,
    getPropiedadPorId: getPropiedadPorId,
    guardarPropiedad: guardarPropiedad,
    eliminarPropiedad: eliminarPropiedad,
    nuevoIdPropiedad: nuevoIdPropiedad,
    marcarArrendada: marcarArrendada,
    esVisiblePublico: esVisiblePublico,

    getUsuarios: getUsuarios,
    getUsuarioPorCorreo: getUsuarioPorCorreo,
    getUsuarioPorRun: getUsuarioPorRun,
    guardarUsuario: guardarUsuario,
    eliminarUsuario: eliminarUsuario,

    iniciarSesion: iniciarSesion,
    cerrarSesion: cerrarSesion,
    getSesion: getSesion,

    getSolicitudes: getSolicitudes,
    estaEnSolicitudes: estaEnSolicitudes,
    agregarSolicitud: agregarSolicitud,
    quitarSolicitud: quitarSolicitud,
    vaciarSolicitudes: vaciarSolicitudes,

    getBlog: getBlog,
    getPostPorId: getPostPorId,
    guardarPost: guardarPost,
    eliminarPost: eliminarPost,
    nuevoIdPost: nuevoIdPost,

    getMensajes: getMensajes,
    guardarMensaje: guardarMensaje,
    marcarMensajeLeido: marcarMensajeLeido,
    eliminarMensaje: eliminarMensaje,
    contarMensajesNoLeidos: contarMensajesNoLeidos,

    getTramites: getTramites,
    getTramitePorId: getTramitePorId,
    guardarTramite: guardarTramite,
    eliminarTramite: eliminarTramite,
    nuevoIdTramite: nuevoIdTramite
  };
})();