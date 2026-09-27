/* AuraArriendos — admin/blog-form.html: crear y editar publicaciones del blog.
   Reglas: título requerido máx. 100, resumen requerido máx. 200, autor
   requerido máx. 60, fecha requerida, contenido requerido máx. 5000
   (párrafos separados por una línea en blanco), imagen opcional. */
(function () {
  "use strict";

  var IMAGEN_POR_DEFECTO = "../img/blog-1.jpg";

  function getParam(key) { return new URLSearchParams(window.location.search).get(key); }
  function rutaImagen(src) { return String(src || "").indexOf("data:") === 0 ? src : "../" + src; }
  function hoyISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* Reduce la imagen a máx. 1200 px de ancho para no llenar el localStorage. */
  function comprimirImagen(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var max = 1200;
        var escala = img.width > max ? max / img.width : 1;
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function () { callback(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function init(sesion) {
    var form = document.getElementById("blog-form");
    if (!form || !window.AuraStore || !window.AuraValidators) return;

    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }

    var V = window.AuraValidators;
    var titulo = form.querySelector("#b-titulo");
    var resumen = form.querySelector("#b-resumen");
    var autor = form.querySelector("#b-autor");
    var fecha = form.querySelector("#b-fecha");
    var contenido = form.querySelector("#b-contenido");
    var imagenInput = form.querySelector("#b-imagen");
    var imagenPreview = form.querySelector("[data-image-preview]");
    var resumenCount = form.querySelector("[data-resumen-count]");
    var alertBox = form.querySelector("[data-form-alert]");
    var heading = document.querySelector("[data-form-heading]");

    var id = getParam("id");
    var editando = !!id;
    var existente = editando ? window.AuraStore.getPostPorId(id) : null;
    if (editando && !existente) { window.location.href = "blog.html"; return; }
    if (heading) heading.textContent = editando ? "Editar publicación" : "Nueva publicación";

    var imagenActual = "";

    function mostrarPreview(src) {
      imagenPreview.innerHTML = src ? '<img src="' + src + '" alt="Vista previa" style="width:120px;height:90px;object-fit:cover;border-radius:10px;">' : "";
    }

    if (editando) {
      titulo.value = existente.titulo;
      resumen.value = existente.resumen || "";
      autor.value = existente.autor || "";
      fecha.value = existente.fecha;
      contenido.value = (existente.contenido || []).join("\n\n");
      imagenActual = existente.imagen || "";
      if (imagenActual) mostrarPreview(rutaImagen(imagenActual));
    } else {
      autor.value = "Equipo AuraArriendos";
      fecha.value = hoyISO();
    }
    resumenCount.textContent = resumen.value.length + " / 200";

    imagenInput.addEventListener("change", function () {
      var file = imagenInput.files[0];
      if (!file) return;
      comprimirImagen(file, function (dataUrl) {
        imagenActual = dataUrl;
        mostrarPreview(dataUrl);
      });
    });

    function parrafos() {
      return contenido.value.split(/\n\s*\n/).map(function (p) { return p.replace(/\s+/g, " ").trim(); }).filter(Boolean);
    }

    function checkTitulo() { return V.validarCampo(titulo, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100); }, "Requerido, máximo 100 caracteres."); }
    function checkResumen() {
      resumenCount.textContent = resumen.value.length + " / 200";
      return V.validarCampo(resumen, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 200); }, "Requerido, máximo 200 caracteres.");
    }
    function checkAutor() { return V.validarCampo(autor, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 60); }, "Requerido, máximo 60 caracteres."); }
    function checkFecha() { return V.validarCampo(fecha, function (v) { return V.requerido(v); }, "Selecciona una fecha."); }
    function checkContenido() { return V.validarCampo(contenido, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 5000); }, "Escribe el artículo (máximo 5000 caracteres)."); }

    titulo.addEventListener("input", checkTitulo);
    resumen.addEventListener("input", checkResumen);
    autor.addEventListener("input", checkAutor);
    fecha.addEventListener("change", checkFecha);
    contenido.addEventListener("input", checkContenido);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkTitulo(), checkResumen(), checkAutor(), checkFecha(), checkContenido()];
      if (!checks.every(Boolean)) {
        alertBox.textContent = "Revisa los campos marcados en rojo.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }

      var post = {
        id: editando ? existente.id : window.AuraStore.nuevoIdPost(titulo.value),
        titulo: titulo.value.trim(),
        resumen: resumen.value.trim(),
        imagen: imagenActual || IMAGEN_POR_DEFECTO,
        fecha: fecha.value,
        autor: autor.value.trim(),
        contenido: parrafos()
      };

      if (!window.AuraStore.guardarPost(post)) {
        alertBox.textContent = "No se pudo guardar: el almacenamiento del navegador está lleno. Prueba con una imagen más liviana.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }
      if (window.AuraToast) window.AuraToast(editando ? "Publicación actualizada" : "Publicación creada", "success");
      window.location.href = "blog.html";
    });
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
