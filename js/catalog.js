/* AuraArriendos — renderizado del catálogo de propiedades.
   Cubre tres páginas distintas (home, propiedades.html, propiedad-detalle.html);
   cada mount revisa si su contenedor existe antes de hacer nada, así el mismo
   archivo puede cargarse en cualquiera de ellas sin duplicar ni fallar. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  var ICONS = { dormitorios: "🛏", banos: "🛁", m2: "📐", estacionamiento: "🚗" };
  var CATEGORY_IMG = { Casa: "../img/prop-2.jpg", Departamento: "../img/prop-3.jpg" };

  function formatPrice(n) {
    return "$" + Number(n || 0).toLocaleString("es-CL");
  }

  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Obtiene la primera foto principal de la propiedad */
  function getMainImage(p) {
    if (p.imagenes && p.imagenes.length > 0) return p.imagenes[0];
    return p.imagen || "";
  }

  /* Solo propiedades aprobadas y que no estén arrendadas */
  function publicadas(lista) {
    return lista.filter(function (p) { return p.estado === "publicada" && !p.arrendada; });
  }

  function propertyCardHTML(p) {
    var enSolicitudes = window.AuraStore && window.AuraStore.estaEnSolicitudes(p.id);
    var fotoPortada = getMainImage(p);

    return (
      '<article class="property-card">' +
        '<a href="propiedad-detalle.html?id=' + encodeURIComponent(p.id) + '" class="property-media">' +
          '<img src="' + fotoPortada + '" alt="' + escHTML(p.nombre) + '" loading="lazy" decoding="async">' +
          '<span class="property-tag">' + escHTML(p.categoria) + "</span>" +
          '<button type="button" class="property-fav' + (enSolicitudes ? " is-active" : "") + '" data-toggle-request="' + p.id + '" aria-label="Guardar en mis solicitudes" title="Guardar en mis solicitudes">' + (enSolicitudes ? "♥" : "♡") + "</button>" +
        "</a>" +
        '<div class="property-body">' +
          '<a href="propiedad-detalle.html?id=' + encodeURIComponent(p.id) + '">' +
            '<p class="property-loc">📍 ' + escHTML(p.comuna) + ", " + escHTML(p.region.replace("Región Metropolitana de Santiago", "RM")) + "</p>" +
            '<h3 class="property-title">' + escHTML(p.nombre) + "</h3>" +
          "</a>" +
          '<div class="property-specs">' +
            (p.dormitorios ? "<span>" + ICONS.dormitorios + " " + p.dormitorios + "</span>" : "") +
            (p.banos ? "<span>" + ICONS.banos + " " + p.banos + "</span>" : "") +
            '<span>' + ICONS.m2 + " " + p.m2 + " m²</span>" +
            (p.estacionamiento ? "<span>" + ICONS.estacionamiento + " Sí</span>" : "") +
          "</div>" +
          '<div class="property-price"><strong>' + formatPrice(p.precio) + "</strong><small>/ mes</small></div>" +
        "</div>" +
      "</article>"
    );
  }

  function bindFavButtons(scope) {
    $$("[data-toggle-request]", scope).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute("data-toggle-request");
        if (!window.AuraStore) return;
        if (!window.AuraRequireLogin()) return;
        var activo;
        if (window.AuraStore.estaEnSolicitudes(id)) {
          window.AuraStore.quitarSolicitud(id);
          activo = false;
        } else {
          window.AuraStore.agregarSolicitud(id);
          activo = true;
        }
        btn.classList.toggle("is-active", activo);
        btn.textContent = activo ? "♥" : "♡";
        if (window.AuraUpdateRequestBadge) window.AuraUpdateRequestBadge();
        if (window.AuraToast) window.AuraToast(activo ? "Agregado a mis solicitudes" : "Quitado de mis solicitudes", activo ? "success" : "");
      });
    });
  }

  /* ---------- Home: filtro, categorías, destacadas, testimonios, blog ---------- */

  function mountHomeFilter() {
    var form = $("#home-filter-form");
    if (!form || !window.AuraRegiones) return;
    var region = $("#f-region", form);
    var comuna = $("#f-comuna", form);
    var tipo = $("#f-tipo", form);

    window.AuraRegiones.enlazar(region, comuna, { placeholderRegion: "Todas las regiones", placeholderComuna: "Todas las comunas" });
    comuna.disabled = false;
    comuna.innerHTML = '<option value="">Todas las comunas</option>';
    region.addEventListener("change", function () {
      if (!region.value) {
        comuna.disabled = false;
        comuna.innerHTML = '<option value="">Todas las comunas</option>';
      }
    });

    var categorias = (window.__AURA__ && window.__AURA__.categorias) || [];
    tipo.innerHTML = '<option value="">Todos los tipos</option>' + categorias.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      if (region.value) params.set("region", region.value);
      if (comuna.value) params.set("comuna", comuna.value);
      if (tipo.value) params.set("categoria", tipo.value);
      var precio = $("#f-precio", form).value;
      if (precio) params.set("precioMax", precio);
      window.location.href = "propiedades.html?" + params.toString();
    });
  }

  function mountCategories() {
    var target = $("[data-categories]");
    if (!target || target.children.length > 0) return;
    var categorias = (window.__AURA__ && window.__AURA__.categorias) || [];
    target.innerHTML = categorias.map(function (c) {
      return (
        '<a href="propiedades.html?categoria=' + encodeURIComponent(c) + '" class="category-card">' +
          '<img src="' + CATEGORY_IMG[c] + '" alt="' + c + '" loading="lazy">' +
          '<span class="category-label">' + c + '<span>Ver disponibles</span></span>' +
        "</a>"
      );
    }).join("");
  }

  function mountFeatured() {
    var target = $("[data-featured-properties]");
    if (!target || target.children.length > 0 || !window.AuraStore) return;
    var destacadas = publicadas(window.AuraStore.getPropiedades()).filter(function (p) { return p.destacada; });
    target.innerHTML = destacadas.map(propertyCardHTML).join("");
    bindFavButtons(target);
  }

  function mountTestimonials() {
    var target = $("[data-testimonial-slides]");
    if (!target || target.children.length > 0) return;
    var lista = (window.__AURA__ && window.__AURA__.testimonios) || [];
    target.innerHTML = lista.map(function (t, i) {
      return (
        '<div class="testimonial-slide' + (i === 0 ? " is-active" : "") + '">' +
          '<p class="testimonial-stars">' + "★".repeat(t.rating) + "☆".repeat(5 - t.rating) + "</p>" +
          '<p class="testimonial-quote">“' + escHTML(t.texto) + '”</p>' +
          '<div class="testimonial-author">' +
            '<div class="testimonial-avatar">' + escHTML(t.nombre.charAt(0)) + "</div>" +
            '<div><strong>' + escHTML(t.nombre) + '</strong><span>' + escHTML(t.comuna) + "</span></div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  function mountBlogPreview() {
    var target = $("[data-blog-preview]");
    if (!target || target.children.length > 0) return;
    var lista = window.AuraStore ? window.AuraStore.getBlog() : ((window.__AURA__ && window.__AURA__.blog) || []);
    var limite = parseInt(target.getAttribute("data-blog-limit"), 10);
    if (!isNaN(limite)) lista = lista.slice(0, limite);
    if (!lista.length) {
      target.innerHTML = '<div class="empty-state"><p class="glyph">📝</p><h3>Aún no hay publicaciones</h3><p>Vuelve pronto para leer nuestras guías.</p></div>';
      return;
    }
    target.innerHTML = lista.map(function (b) {
      return (
        '<article class="blog-card">' +
          '<a href="blog-detalle.html?id=' + b.id + '" class="blog-media"><img src="' + b.imagen + '" alt="' + escHTML(b.titulo) + '" loading="lazy"></a>' +
          '<div class="blog-body">' +
            '<span class="blog-meta">' + new Date(b.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) + "</span>" +
            '<h3 class="blog-title">' + escHTML(b.titulo) + "</h3>" +
            '<p class="blog-excerpt">' + escHTML(b.resumen) + "</p>" +
            '<a href="blog-detalle.html?id=' + b.id + '" class="blog-link">Leer artículo</a>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ---------- Página propiedades.html: listado completo + filtros ---------- */

  function mountListado() {
    var target = $("[data-listado-propiedades]");
    if (!target || !window.AuraStore) return;

    var form = $("#catalog-filter-form");
    var region = $("#lf-region", form);
    var comuna = $("#lf-comuna", form);
    var tipo = $("#lf-tipo", form);
    var precio = $("#lf-precio", form);
    var orden = $("#lf-orden", form);
    var resultsCount = $("[data-results-count]");
    var emptyState = $("[data-empty-state]");
    var chipsWrap = $("[data-active-chips]");

    var categorias = (window.__AURA__ && window.__AURA__.categorias) || [];
    tipo.innerHTML = '<option value="">Todos los tipos</option>' + categorias.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");

    window.AuraRegiones.enlazar(region, comuna, {
      placeholderRegion: "Todas las regiones",
      placeholderComuna: "Todas las comunas",
      regionSeleccionada: getParam("region") || "",
      comunaSeleccionada: getParam("comuna") || ""
    });
    if (!region.value) { comuna.disabled = false; comuna.innerHTML = '<option value="">Todas las comunas</option>'; }

    if (getParam("categoria")) tipo.value = getParam("categoria");
    if (getParam("precioMax")) precio.value = getParam("precioMax");

    function currentFilters() {
      return {
        region: region.value,
        comuna: comuna.value,
        categoria: tipo.value,
        precioMax: precio.value ? Number(precio.value) : null,
        orden: orden.value
      };
    }

    function renderChips(f) {
      if (!chipsWrap) return;
      var chips = [];
      if (f.region) chips.push(["region", "Región: " + f.region]);
      if (f.comuna) chips.push(["comuna", "Comuna: " + f.comuna]);
      if (f.categoria) chips.push(["categoria", "Tipo: " + f.categoria]);
      if (f.precioMax) chips.push(["precioMax", "Máx: " + formatPrice(f.precioMax)]);
      chipsWrap.innerHTML = chips.map(function (c) {
        return '<span class="chip">' + escHTML(c[1]) + ' <button type="button" data-clear-chip="' + c[0] + '" aria-label="Quitar filtro">×</button></span>';
      }).join("");
      $$("[data-clear-chip]", chipsWrap).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-clear-chip");
          if (key === "region") { region.value = ""; region.dispatchEvent(new Event("change")); comuna.value = ""; }
          if (key === "comuna") comuna.value = "";
          if (key === "categoria") tipo.value = "";
          if (key === "precioMax") precio.value = "";
          render();
        });
      });
    }

    function render() {
      var f = currentFilters();
      var lista = publicadas(window.AuraStore.getPropiedades()).filter(function (p) {
        if (f.region && p.region !== f.region) return false;
        if (f.comuna && p.comuna !== f.comuna) return false;
        if (f.categoria && p.categoria !== f.categoria) return false;
        if (f.precioMax && p.precio > f.precioMax) return false;
        return true;
      });

      if (f.orden === "precio-asc") lista.sort(function (a, b) { return a.precio - b.precio; });
      if (f.orden === "precio-desc") lista.sort(function (a, b) { return b.precio - a.precio; });

      target.innerHTML = lista.map(propertyCardHTML).join("");
      bindFavButtons(target);
      if (resultsCount) resultsCount.textContent = lista.length;
      if (emptyState) emptyState.classList.toggle("hidden", lista.length !== 0);
      renderChips(f);
    }

    [region, tipo, precio, orden].forEach(function (el) { el.addEventListener("change", render); });
    precio.addEventListener("input", render);
    comuna.addEventListener("change", render);

    var resetBtn = $("[data-reset-filters]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        region.dispatchEvent(new Event("change"));
        render();
      });
    }

    render();
  }

  /* ---------- Página propiedad-detalle.html ---------- */

  function mountDetalle() {
    var target = $("[data-property-detail]");
    if (!target || !window.AuraStore) return;
    var id = getParam("id");
    var p = window.AuraStore.getPropiedadPorId(id);

    if (!p) {
      target.innerHTML = '<div class="empty-state"><p class="glyph">🔍</p><h3>No encontramos esa propiedad</h3><p>Puede que ya no esté disponible.</p><a href="propiedades.html" class="btn btn-primary mt-2">Volver al listado</a></div>';
      return;
    }

    var sesion = window.AuraStore.getSesion();
    var esStaff = !!sesion && (sesion.tipoUsuario === "Administrador" || sesion.tipoUsuario === "Agente");
    if (p.arrendada && !esStaff) {
      target.innerHTML = '<div class="empty-state"><p class="glyph">🔑</p><h3>Esta propiedad ya fue arrendada</h3><p>Por ahora no está disponible. Revisa otras opciones similares en nuestro listado.</p><a href="propiedades.html" class="btn btn-primary mt-2">Ver propiedades disponibles</a></div>';
      return;
    }

    document.title = p.nombre + " — AuraArriendos";
    var enSolicitudes = window.AuraStore.estaEnSolicitudes(p.id);

    // Galería con miniaturas múltiples
    var fotos = (p.imagenes && p.imagenes.length > 0) ? p.imagenes : [p.imagen];
    var thumbsHTML = "";

    if (fotos.length > 1) {
      thumbsHTML = '<div class="detail-gallery-thumbs" style="display:flex;gap:10px;margin-top:12px;overflow-x:auto;">' +
        fotos.map(function (url, idx) {
          return '<img src="' + url + '" class="detail-thumb' + (idx === 0 ? " is-active" : "") + '" data-thumb-src="' + url + '" style="width:80px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;opacity:' + (idx === 0 ? "1" : "0.6") + ';border:2px solid ' + (idx === 0 ? "#1a3c34" : "transparent") + ';transition:all 0.2s;" alt="Foto ' + (idx + 1) + '">';
        }).join('') +
      '</div>';
    }

    target.innerHTML =
      '<div class="detail-gallery">' +
        '<div class="detail-gallery-main"><img src="' + fotos[0] + '" alt="' + escHTML(p.nombre) + '" id="detail-main-img"></div>' +
        thumbsHTML +
      "</div>" +
      '<div class="detail-info">' +
        '<p class="property-loc">📍 ' + escHTML(p.direccion) + ", " + escHTML(p.comuna) + "</p>" +
        '<h1>' + escHTML(p.nombre) + "</h1>" +
        (p.arrendada ? '<p class="status-pill status-arrendada mt-1">Arrendada — oculta del sitio público</p>' : "") +
        '<p class="detail-price">' + formatPrice(p.precio) + ' <small style="font-size:1rem;color:var(--ink-mute)">/ mes</small></p>' +
        '<div class="detail-specs">' +
          '<div class="detail-spec"><strong>' + p.dormitorios + '</strong><span>Dormitorios</span></div>' +
          '<div class="detail-spec"><strong>' + p.banos + '</strong><span>Baños</span></div>' +
          '<div class="detail-spec"><strong>' + p.m2 + ' m²</strong><span>Superficie</span></div>' +
          '<div class="detail-spec"><strong>' + (p.estacionamiento ? "Sí" : "No") + '</strong><span>Estacionamiento</span></div>' +
        "</div>" +
        '<div class="detail-actions">' +
          '<button type="button" class="btn btn-primary" data-toggle-request="' + p.id + '">' + (enSolicitudes ? "♥ En mis solicitudes" : "♡ Agregar a mis solicitudes") + "</button>" +
          '<a href="contacto.html" class="btn btn-ghost">Contactar al arrendador</a>' +
        "</div>" +
        '<p class="detail-desc">' + escHTML(p.descripcion) + "</p>" +
      "</div>";

    // Evento para cambiar de foto al hacer clic en una miniatura
    var mainImg = $("#detail-main-img", target);
    $$(".detail-thumb", target).forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var nuevaRuta = thumb.getAttribute("data-thumb-src");
        if (mainImg) mainImg.src = nuevaRuta;

        $$(".detail-thumb", target).forEach(function (t) {
          t.style.opacity = "0.6";
          t.style.borderColor = "transparent";
          t.classList.remove("is-active");
        });

        thumb.style.opacity = "1";
        thumb.style.borderColor = "#1a3c34";
        thumb.classList.add("is-active");
      });
    });

    var favBtn = $("[data-toggle-request]", target);
    favBtn.addEventListener("click", function () {
      if (!window.AuraRequireLogin()) return;
      var activo;
      if (window.AuraStore.estaEnSolicitudes(p.id)) {
        window.AuraStore.quitarSolicitud(p.id);
        activo = false;
      } else {
        window.AuraStore.agregarSolicitud(p.id);
        activo = true;
      }
      favBtn.innerHTML = activo ? "♥ En mis solicitudes" : "♡ Agregar a mis solicitudes";
      if (window.AuraUpdateRequestBadge) window.AuraUpdateRequestBadge();
      if (window.AuraToast) window.AuraToast(activo ? "Agregado a mis solicitudes" : "Quitado de mis solicitudes", activo ? "success" : "");
    });

    var relatedTarget = $("[data-related-properties]");
    if (relatedTarget) {
      var relacionadas = publicadas(window.AuraStore.getPropiedades())
        .filter(function (x) { return x.id !== p.id && (x.categoria === p.categoria || x.comuna === p.comuna); })
        .slice(0, 4);
      relatedTarget.innerHTML = relacionadas.map(propertyCardHTML).join("");
      bindFavButtons(relatedTarget);
    }
  }

  function boot() {
    mountHomeFilter();
    mountCategories();
    mountFeatured();
    mountTestimonials();
    mountBlogPreview();
    mountListado();
    mountDetalle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();