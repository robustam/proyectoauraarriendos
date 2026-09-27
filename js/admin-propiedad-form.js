/* AuraArriendos — admin/propiedad-form.html: alta y edición de propiedades.
   Reglas de la pauta: código req. min 3 (sin máximo), nombre req. max 100,
   descripción opcional max 500, precio req. min 0 (decimales permitidos),
   stock (unidadesDisponibles) req. min 0 entero, stock crítico opcional
   min 0 entero, categoría requerida, imagen opcional. */
(function () {
  "use strict";

  function getParam(key) { return new URLSearchParams(window.location.search).get(key); }

  function init(sesion) {
    var form = document.getElementById("propiedad-form");
    if (!form || !window.AuraStore || !window.AuraValidators || !window.AuraRegiones) return;

    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }

    var V = window.AuraValidators;
    var categorias = (window.__AURA__ && window.__AURA__.categorias) || [];

    var codigo = form.querySelector("#a-codigo");
    var nombre = form.querySelector("#a-nombre");
    var descripcion = form.querySelector("#a-descripcion");
    var precio = form.querySelector("#a-precio");
    var unidades = form.querySelector("#a-unidades");
    var alerta = form.querySelector("#a-alerta");
    var categoria = form.querySelector("#a-categoria");
    var region = form.querySelector("#a-region");
    var comuna = form.querySelector("#a-comuna");
    var direccion = form.querySelector("#a-direccion");
    var m2 = form.querySelector("#a-m2");
    var dormitorios = form.querySelector("#a-dormitorios");
    var banos = form.querySelector("#a-banos");
    var estacionamiento = form.querySelector("#a-estacionamiento");
    var estado = form.querySelector("#a-estado");
    var destacada = form.querySelector("#a-destacada");
    var arrendada = form.querySelector("#a-arrendada");
    var imagenInput = form.querySelector("#a-imagen");
    var imagenPreview = form.querySelector("[data-image-preview]");
    var alertBox = form.querySelector("[data-form-alert]");
    var heading = document.querySelector("[data-form-heading]");

    categoria.innerHTML = categorias.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");

    var id = getParam("id");
    var editando = !!id;
    var existente = editando ? window.AuraStore.getPropiedadPorId(id) : null;
    if (editando && !existente) { window.location.href = "propiedades.html"; return; }

    var imagenDataUrl = "";
    if (heading) heading.textContent = editando ? "Editar propiedad" : "Nueva propiedad";

    codigo.value = editando ? existente.codigo : window.AuraStore.nuevoIdPropiedad();

    if (editando) {
      nombre.value = existente.nombre;
      descripcion.value = existente.descripcion || "";
      precio.value = existente.precio;
      unidades.value = existente.unidadesDisponibles;
      alerta.value = existente.alertaDisponibilidad != null ? existente.alertaDisponibilidad : "";
      categoria.value = existente.categoria;
      direccion.value = existente.direccion;
      m2.value = existente.m2;
      dormitorios.value = existente.dormitorios;
      banos.value = existente.banos;
      estacionamiento.checked = !!existente.estacionamiento;
      estado.value = existente.estado;
      destacada.checked = !!existente.destacada;
      arrendada.checked = !!existente.arrendada;
      imagenDataUrl = existente.imagen;
      if (imagenDataUrl) imagenPreview.innerHTML = '<img src="' + (imagenDataUrl.indexOf("data:") === 0 ? imagenDataUrl : "../" + imagenDataUrl) + '" alt="Vista previa" style="width:120px;height:90px;object-fit:cover;border-radius:10px;">';
    }

    window.AuraRegiones.enlazar(region, comuna, {
      regionSeleccionada: editando ? existente.region : "",
      comunaSeleccionada: editando ? existente.comuna : ""
    });

    imagenInput.addEventListener("change", function () {
      var file = imagenInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        imagenDataUrl = e.target.result;
        imagenPreview.innerHTML = '<img src="' + imagenDataUrl + '" alt="Vista previa" style="width:120px;height:90px;object-fit:cover;border-radius:10px;">';
      };
      reader.readAsDataURL(file);
    });

    function checkNombre() { return V.validarCampo(nombre, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100); }, "Requerido, máximo 100 caracteres."); }
    function checkDescripcion() { return V.validarCampo(descripcion, function (v) { return V.largoEntre(v, 0, 500); }, "Máximo 500 caracteres."); }
    function checkPrecio() { return V.validarCampo(precio, function (v) { return V.numeroEntre(v, 0, null); }, "Debe ser 0 o mayor."); }
    function checkUnidades() { return V.validarCampo(unidades, function (v) { return V.esEntero(v) && V.numeroEntre(v, 0, null); }, "Entero, 0 o mayor."); }
    function checkAlerta() { return V.validarCampo(alerta, function (v) { return v === "" || (V.esEntero(v) && V.numeroEntre(v, 0, null)); }, "Entero, 0 o mayor."); }
    function checkCategoria() { return V.validarCampo(categoria, function (v) { return V.requerido(v); }, "Selecciona una categoría."); }
    function checkRegion() { return V.validarCampo(region, function (v) { return V.requerido(v); }, "Selecciona una región."); }
    function checkComuna() { return V.validarCampo(comuna, function (v) { return V.requerido(v); }, "Selecciona una comuna."); }
    function checkDireccion() { return V.validarCampo(direccion, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 300); }, "Máximo 300 caracteres."); }
    function checkM2() { return V.validarCampo(m2, function (v) { return V.numeroEntre(v, 1, null); }, "Ingresa la superficie."); }

    [[nombre, checkNombre], [descripcion, checkDescripcion], [precio, checkPrecio],
     [unidades, checkUnidades], [alerta, checkAlerta], [direccion, checkDireccion], [m2, checkM2]]
      .forEach(function (pair) { pair[0].addEventListener("input", pair[1]); });
    categoria.addEventListener("change", checkCategoria);
    region.addEventListener("change", function () { checkRegion(); window.setTimeout(checkComuna, 0); });
    comuna.addEventListener("change", checkComuna);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkNombre(), checkDescripcion(), checkPrecio(), checkUnidades(), checkAlerta(), checkCategoria(), checkRegion(), checkComuna(), checkDireccion(), checkM2()];
      if (!checks.every(Boolean)) {
        alertBox.textContent = "Revisa los campos marcados en rojo.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }

      var propiedad = {
        id: editando ? existente.id : codigo.value,
        codigo: codigo.value,
        nombre: nombre.value.trim(),
        categoria: categoria.value,
        region: region.value,
        comuna: comuna.value,
        direccion: direccion.value.trim(),
        precio: Number(precio.value),
        dormitorios: Number(dormitorios.value || 0),
        banos: Number(banos.value || 0),
        m2: Number(m2.value),
        estacionamiento: estacionamiento.checked,
        unidadesDisponibles: Number(unidades.value),
        alertaDisponibilidad: alerta.value === "" ? null : Number(alerta.value),
        imagen: imagenDataUrl || "../img/prop-1.jpg",
        descripcion: descripcion.value.trim(),
        estado: estado.value,
        destacada: destacada.checked,
        arrendada: arrendada.checked,
        publicadoPor: editando ? existente.publicadoPor : sesion.correo
      };
      if (propiedad.arrendada) {
        propiedad.fechaArrendada = (editando && existente.fechaArrendada) || new Date().toISOString();
      }
      if (editando && existente.motivoRechazo && propiedad.estado === "rechazada") propiedad.motivoRechazo = existente.motivoRechazo;
      window.AuraStore.guardarPropiedad(propiedad);
      if (window.AuraToast) window.AuraToast(editando ? "Propiedad actualizada" : "Propiedad creada", "success");
      window.location.href = "propiedades.html";
    });
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
