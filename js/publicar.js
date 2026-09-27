/* AuraArriendos — formulario para que un usuario logueado publique su
   propiedad. Queda en estado "pendiente" hasta que un administrador la
   aprueba o rechaza (ver admin/propiedades.html). Mismas reglas de
   validación que "Nuevo producto" del panel administrador. */
(function () {
  "use strict";

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatPrice(n) { return "$" + Number(n || 0).toLocaleString("es-CL"); }

  function mount() {
    var gate = document.querySelector("[data-publish-gate]");
    var form = document.getElementById("publicar-form");
    if (!gate || !form || !window.AuraStore || !window.AuraValidators || !window.AuraRegiones) return;

    var sesion = window.AuraStore.getSesion();
    if (!sesion) {
      gate.classList.remove("hidden");
      form.closest("[data-publish-form-wrap]").classList.add("hidden");
      return;
    }
    gate.classList.add("hidden");

    var V = window.AuraValidators;
    var categorias = (window.__AURA__ && window.__AURA__.categorias) || [];

    var codigo = form.querySelector("#p-codigo");
    var nombre = form.querySelector("#p-nombre");
    var descripcion = form.querySelector("#p-descripcion");
    var precio = form.querySelector("#p-precio");
    var unidades = form.querySelector("#p-unidades");
    var alerta = form.querySelector("#p-alerta");
    var categoria = form.querySelector("#p-categoria");
    var region = form.querySelector("#p-region");
    var comuna = form.querySelector("#p-comuna");
    var direccion = form.querySelector("#p-direccion");
    var m2 = form.querySelector("#p-m2");
    var dormitorios = form.querySelector("#p-dormitorios");
    var banos = form.querySelector("#p-banos");
    var estacionamiento = form.querySelector("#p-estacionamiento");
    var imagenInput = form.querySelector("#p-imagen");
    var imagenPreview = form.querySelector("[data-image-preview]");
    var alertBox = form.querySelector("[data-form-alert]");

    categoria.innerHTML = '<option value="">Selecciona un tipo</option>' + categorias.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");
    window.AuraRegiones.enlazar(region, comuna, {});

    var imagenDataUrl = "";
    imagenInput.addEventListener("change", function () {
      var file = imagenInput.files[0];
      if (!file) { imagenPreview.innerHTML = ""; imagenDataUrl = ""; return; }
      var reader = new FileReader();
      reader.onload = function (e) {
        imagenDataUrl = e.target.result;
        imagenPreview.innerHTML = '<img src="' + imagenDataUrl + '" alt="Vista previa" style="width:120px;height:90px;object-fit:cover;border-radius:10px;">';
      };
      reader.readAsDataURL(file);
    });

    function checkCodigo() { return V.validarCampo(codigo, function (v) { return V.requerido(v) && V.largoEntre(v, 3, null); }, "El código debe tener al menos 3 caracteres."); }
    function checkNombre() { return V.validarCampo(nombre, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100); }, "Ingresa un título (máximo 100 caracteres)."); }
    function checkDescripcion() { return V.validarCampo(descripcion, function (v) { return V.largoEntre(v, 0, 500); }, "Máximo 500 caracteres."); }
    function checkPrecio() { return V.validarCampo(precio, function (v) { return V.numeroEntre(v, 0, null); }, "El precio debe ser 0 o mayor."); }
    function checkUnidades() { return V.validarCampo(unidades, function (v) { return V.esEntero(v) && V.numeroEntre(v, 0, null); }, "Ingresa un número entero de unidades disponibles (0 o más)."); }
    function checkAlerta() { return V.validarCampo(alerta, function (v) { return v === "" || (V.esEntero(v) && V.numeroEntre(v, 0, null)); }, "Debe ser un número entero de 0 o más."); }
    function checkCategoria() { return V.validarCampo(categoria, function (v) { return V.requerido(v); }, "Selecciona un tipo de inmueble."); }
    function checkRegion() { return V.validarCampo(region, function (v) { return V.requerido(v); }, "Selecciona una región."); }
    function checkComuna() { return V.validarCampo(comuna, function (v) { return V.requerido(v); }, "Selecciona una comuna."); }
    function checkDireccion() { return V.validarCampo(direccion, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 300); }, "Ingresa la dirección (máximo 300 caracteres)."); }
    function checkM2() { return V.validarCampo(m2, function (v) { return V.numeroEntre(v, 1, null); }, "Ingresa la superficie en m²."); }

    [[codigo, checkCodigo], [nombre, checkNombre], [descripcion, checkDescripcion], [precio, checkPrecio],
     [unidades, checkUnidades], [alerta, checkAlerta], [direccion, checkDireccion], [m2, checkM2]]
      .forEach(function (pair) { pair[0].addEventListener("input", pair[1]); });
    categoria.addEventListener("change", checkCategoria);
    region.addEventListener("change", function () { checkRegion(); window.setTimeout(checkComuna, 0); });
    comuna.addEventListener("change", checkComuna);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkCodigo(), checkNombre(), checkDescripcion(), checkPrecio(), checkUnidades(), checkAlerta(), checkCategoria(), checkRegion(), checkComuna(), checkDireccion(), checkM2()];
      if (!checks.every(Boolean)) {
        alertBox.textContent = "Revisa los campos marcados en rojo.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }

      var nueva = {
        id: window.AuraStore.nuevoIdPropiedad(),
        codigo: codigo.value.trim(),
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
        estado: "pendiente",
        destacada: false,
        publicadoPor: sesion.correo
      };
      window.AuraStore.guardarPropiedad(nueva);
      form.reset();
      imagenPreview.innerHTML = "";
      window.AuraRegiones.enlazar(region, comuna, {});
      alertBox.textContent = "¡Listo! Tu propiedad fue enviada a revisión. Te avisaremos cuando sea aprobada.";
      alertBox.className = "form-alert success";
      alertBox.classList.remove("hidden");
      if (window.AuraToast) window.AuraToast("Publicación enviada a revisión", "success");
      renderMisPublicaciones();
    });

    function renderMisPublicaciones() {
      var target = document.querySelector("[data-mis-publicaciones]");
      if (!target) return;
      var mias = window.AuraStore.getPropiedades().filter(function (p) { return p.publicadoPor === sesion.correo; });
      if (!mias.length) {
        target.innerHTML = '<p class="lede">Aún no has publicado ninguna propiedad.</p>';
        return;
      }
      target.innerHTML = mias.map(function (p) {
        var motivo = p.estado === "rechazada" && p.motivoRechazo
          ? '<p class="meta" style="color:var(--danger)">Motivo: ' + escHTML(p.motivoRechazo) + "</p>"
          : "";
        /* Si la propiedad ya está publicada, el dueño puede marcarla como
           arrendada (se oculta del sitio) o volver a mostrarla. */
        var accion = p.estado === "publicada"
          ? '<button type="button" class="btn btn-ghost btn-sm mt-1" data-toggle-arrendada="' + p.id + '">' + (p.arrendada ? "Volver a publicar" : "Marcar como arrendada") + "</button>"
          : "";
        var estadoVisible = p.arrendada ? "arrendada" : p.estado;
        return (
          '<div class="request-item">' +
            '<img src="' + p.imagen + '" alt="' + escHTML(p.nombre) + '">' +
            '<div><h4>' + escHTML(p.nombre) + '</h4><p class="meta">' + escHTML(p.comuna) + " · " + formatPrice(p.precio) + " / mes</p>" + motivo + accion + "</div>" +
            '<span class="status-pill status-' + estadoVisible + '">' + estadoVisible + "</span>" +
          "</div>"
        );
      }).join("");

      Array.prototype.slice.call(target.querySelectorAll("[data-toggle-arrendada]")).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-toggle-arrendada");
          var actual = window.AuraStore.getPropiedadPorId(id);
          if (!actual) return;
          var nuevoValor = !actual.arrendada;
          window.AuraStore.marcarArrendada(id, nuevoValor);
          if (window.AuraToast) window.AuraToast(nuevoValor ? "Marcada como arrendada: ya no se muestra en el sitio" : "Tu propiedad vuelve a estar visible", "success");
          renderMisPublicaciones();
        });
      });
    }
    renderMisPublicaciones();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
