/* AuraArriendos — helper compartido para selects de Región → Comuna en cascada.
   Se usa en el buscador del home, registro, publicación de arriendos y
   los formularios de administración. window.AuraRegiones es la única API. */
(function () {
  "use strict";

  function regiones() {
    return (window.__AURA__ && window.__AURA__.regiones) || [];
  }

  function comunasDe(nombreRegion) {
    var encontrada = regiones().filter(function (r) { return r.region === nombreRegion; })[0];
    return encontrada ? encontrada.comunas : [];
  }

  /* Llena selectRegion con todas las regiones y enlaza selectComuna para que
     se actualice automáticamente al cambiar de región.
     opts.regionSeleccionada / opts.comunaSeleccionada permiten preseleccionar
     (útil en formularios de edición). opts.placeholderComuna define el texto
     inicial antes de elegir región. */
  function enlazar(selectRegion, selectComuna, opts) {
    opts = opts || {};
    if (!selectRegion || !selectComuna) return;

    selectRegion.innerHTML = '<option value="">' + (opts.placeholderRegion || "Selecciona una región") + "</option>" +
      regiones().map(function (r) {
        return '<option value="' + r.region + '">' + r.region + "</option>";
      }).join("");

    function renderComunas(nombreRegion, comunaPreseleccionada) {
      var lista = comunasDe(nombreRegion);
      if (!lista.length) {
        selectComuna.innerHTML = '<option value="">' + (opts.placeholderComuna || "Selecciona una región primero") + "</option>";
        selectComuna.disabled = true;
        return;
      }
      selectComuna.disabled = false;
      selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>' +
        lista.map(function (c) {
          var sel = c === comunaPreseleccionada ? " selected" : "";
          return '<option value="' + c + '"' + sel + ">" + c + "</option>";
        }).join("");
    }

    selectRegion.addEventListener("change", function () {
      renderComunas(selectRegion.value, null);
    });

    if (opts.regionSeleccionada) {
      selectRegion.value = opts.regionSeleccionada;
      renderComunas(opts.regionSeleccionada, opts.comunaSeleccionada);
    } else {
      renderComunas("", null);
    }
  }

  window.AuraRegiones = { regiones: regiones, comunasDe: comunasDe, enlazar: enlazar };
})();
