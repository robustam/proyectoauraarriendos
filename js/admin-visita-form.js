/* AuraArriendos — admin/visita-form.html: alta y edición de visitas al
   inmueble y entregas al cierre del arriendo. Administrador y Agente pueden
   usar este formulario por completo. Al guardar una entrega con estado
   "Entregado", AuraStore marca la propiedad como arrendada automáticamente. */
(function () {
  "use strict";

  function getParam(key) { return new URLSearchParams(window.location.search).get(key); }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ESTADOS = {
    visita: ["Agendada", "Realizada", "Cancelada"],
    entrega: ["Pendiente", "Entregado"]
  };
  var TITULOS = {
    visita: { nuevo: "Nueva visita", editar: "Editar visita", boton: "Guardar visita" },
    entrega: { nuevo: "Nueva entrega", editar: "Editar entrega", boton: "Guardar entrega" }
  };

  function init(sesion) {
    var form = document.getElementById("tramite-form");
    if (!form || !window.AuraStore || !window.AuraValidators) return;

    var V = window.AuraValidators;
    var propiedadSel = form.querySelector("#t-propiedad");
    var propietarioInfo = form.querySelector("[data-propietario-info]");
    var clienteSel = form.querySelector("#t-cliente");
    var fecha = form.querySelector("#t-fecha");
    var horaField = form.querySelector("[data-hora-field]");
    var hora = form.querySelector("#t-hora");
    var estadoSel = form.querySelector("#t-estado");
    var notas = form.querySelector("#t-notas");
    var alertBox = form.querySelector("[data-form-alert]");
    var heading = document.querySelector("[data-form-heading]");
    var submitBtn = form.querySelector("[data-submit-label]");

    var id = getParam("id");
    var editando = !!id;
    var existente = editando ? window.AuraStore.getTramitePorId(id) : null;
    if (editando && !existente) { window.location.href = "visitas.html"; return; }

    var tipo = editando ? existente.tipo : (getParam("tipo") === "entrega" ? "entrega" : "visita");
    var textos = TITULOS[tipo];
    if (heading) heading.textContent = editando ? textos.editar : textos.nuevo;
    if (submitBtn) submitBtn.textContent = textos.boton;
    horaField.style.display = tipo === "visita" ? "" : "none";

    var propiedades = window.AuraStore.getPropiedades().filter(function (p) { return p.estado === "publicada"; });
    propiedadSel.innerHTML = '<option value="">Selecciona una propiedad</option>' +
      propiedades.map(function (p) { return '<option value="' + p.id + '">' + escHTML(p.nombre) + " — " + escHTML(p.comuna) + "</option>"; }).join("");

    var clientes = window.AuraStore.getUsuarios().filter(function (u) { return u.tipoUsuario === "Cliente"; });
    clienteSel.innerHTML = '<option value="">Selecciona un cliente</option>' +
      clientes.map(function (u) { return '<option value="' + u.correo + '">' + escHTML(u.nombre + " " + u.apellidos) + " (" + escHTML(u.correo) + ")</option>"; }).join("");

    estadoSel.innerHTML = ESTADOS[tipo].map(function (e) { return '<option value="' + e + '">' + e + "</option>"; }).join("");

    function actualizarPropietario() {
      var p = window.AuraStore.getPropiedadPorId(propiedadSel.value);
      if (!p) { propietarioInfo.textContent = "Selecciona una propiedad primero."; return { correo: "", nombre: "" }; }
      if (!p.publicadoPor) { propietarioInfo.textContent = "No especificado (propiedad sin arrendador registrado)."; return { correo: "", nombre: "" }; }
      var u = window.AuraStore.getUsuarioPorCorreo(p.publicadoPor);
      var nombre = u ? (u.nombre + " " + u.apellidos) : "";
      propietarioInfo.textContent = (nombre || p.publicadoPor) + (nombre ? " (" + p.publicadoPor + ")" : "");
      return { correo: p.publicadoPor, nombre: nombre };
    }
    propiedadSel.addEventListener("change", actualizarPropietario);

    if (editando) {
      propiedadSel.value = existente.propiedadId;
      clienteSel.value = existente.clienteCorreo;
      fecha.value = existente.fecha || "";
      hora.value = existente.hora || "";
      estadoSel.value = existente.estado;
      notas.value = existente.notas || "";
    }
    actualizarPropietario();

    function checkPropiedad() { return V.validarCampo(propiedadSel, function (v) { return V.requerido(v); }, "Selecciona una propiedad."); }
    function checkCliente() { return V.validarCampo(clienteSel, function (v) { return V.requerido(v); }, "Selecciona un cliente."); }
    function checkFecha() { return V.validarCampo(fecha, function (v) { return V.requerido(v); }, "Selecciona una fecha."); }
    function checkHora() {
      if (tipo !== "visita") { V.limpiarError(hora); return true; }
      return V.validarCampo(hora, function (v) { return V.requerido(v); }, "Selecciona una hora para la visita.");
    }
    function checkEstado() { return V.validarCampo(estadoSel, function (v) { return V.requerido(v); }, "Selecciona un estado."); }

    propiedadSel.addEventListener("change", checkPropiedad);
    clienteSel.addEventListener("change", checkCliente);
    fecha.addEventListener("input", checkFecha);
    hora.addEventListener("input", checkHora);
    estadoSel.addEventListener("change", checkEstado);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkPropiedad(), checkCliente(), checkFecha(), checkHora(), checkEstado()];
      if (!checks.every(Boolean)) {
        alertBox.textContent = "Revisa los campos marcados en rojo.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }

      var p = window.AuraStore.getPropiedadPorId(propiedadSel.value);
      var c = window.AuraStore.getUsuarioPorCorreo(clienteSel.value);
      var propietario = actualizarPropietario();

      var tramite = {
        id: editando ? existente.id : window.AuraStore.nuevoIdTramite(),
        tipo: tipo,
        propiedadId: propiedadSel.value,
        propiedadNombre: p ? p.nombre : "",
        clienteCorreo: clienteSel.value,
        clienteNombre: c ? (c.nombre + " " + c.apellidos) : clienteSel.value,
        propietarioCorreo: propietario.correo,
        propietarioNombre: propietario.nombre,
        fecha: fecha.value,
        hora: tipo === "visita" ? hora.value : "",
        estado: estadoSel.value,
        notas: notas.value.trim(),
        creadoPor: editando ? existente.creadoPor : sesion.correo
      };
      window.AuraStore.guardarTramite(tramite);
      if (window.AuraToast) {
        var msg = tipo === "entrega" && tramite.estado === "Entregado"
          ? "Entrega guardada. La propiedad quedó marcada como arrendada."
          : (editando ? "Registro actualizado" : (tipo === "visita" ? "Visita agendada" : "Entrega registrada"));
        window.AuraToast(msg, "success");
      }
      window.location.href = "visitas.html";
    });
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
