/* AuraArriendos — comportamiento global compartido por todas las páginas:
   navegación (scroll, menú móvil, sesión), reveals on-scroll, carrusel,
   testimonios, marquee y año del footer. Patrón IIFE, sin módulos ES. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Header: sombra al hacer scroll + menú móvil ---------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".nav-toggle");
    var menu = $(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.classList.remove("is-open");
        });
      });
    }

    var here = window.location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop();
      if (href === here) a.classList.add("active");
    });
  }

  /* ---------- Sesión: refleja usuario logueado y badge de solicitudes ---------- */
  function initSessionAwareNav() {
    if (!window.AuraStore) return;
    var sesion = window.AuraStore.getSesion();
    var guestEls = $$("[data-auth='guest']");
    var userEls = $$("[data-auth='user']");
    var adminLinkEls = $$("[data-auth='admin']");

    if (sesion) {
      guestEls.forEach(function (el) { el.classList.add("hidden"); });
      userEls.forEach(function (el) { el.classList.remove("hidden"); });
      $$("[data-user-name]").forEach(function (el) { el.textContent = sesion.nombre; });
      $$("[data-user-initial]").forEach(function (el) { el.textContent = (sesion.nombre || "?").trim().charAt(0).toUpperCase(); });
      var isStaff = sesion.tipoUsuario === "Administrador" || sesion.tipoUsuario === "Agente";
      adminLinkEls.forEach(function (el) { el.classList.toggle("hidden", !isStaff); });
    } else {
      guestEls.forEach(function (el) { el.classList.remove("hidden"); });
      userEls.forEach(function (el) { el.classList.add("hidden"); });
      adminLinkEls.forEach(function (el) { el.classList.add("hidden"); });
    }

    var logoutBtns = $$("[data-action='logout']");
    logoutBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        window.AuraStore.cerrarSesion();
        window.location.href = "login.html";
      });
    });

    updateRequestBadge();
  }

  function updateRequestBadge() {
    if (!window.AuraStore) return;
    var n = window.AuraStore.getSolicitudes().length;
    $$("[data-request-count]").forEach(function (el) {
      el.textContent = String(n);
      el.classList.toggle("hidden", n === 0);
    });
  }
  window.AuraUpdateRequestBadge = updateRequestBadge;

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 6000);
  }

  /* ---------- Carrusel de propiedades destacadas ---------- */
  function initCarousels() {
    $$("[data-carousel]").forEach(function (carousel) {
      var track = $(".carousel-track", carousel);
      var prev = $("[data-carousel-prev]", carousel);
      var next = $("[data-carousel-next]", carousel);
      if (!track) return;
      function scrollByCard(dir) {
        var card = $(".property-card", track);
        var amount = card ? card.getBoundingClientRect().width + 24 : 300;
        track.scrollBy({ left: dir * amount, behavior: "smooth" });
      }
      if (prev) prev.addEventListener("click", function () { scrollByCard(-1); });
      if (next) next.addEventListener("click", function () { scrollByCard(1); });
    });
  }

  /* ---------- Testimonios rotativos ---------- */
  function initTestimonials() {
    var wrap = $("[data-testimonials]");
    if (!wrap) return;
    var slides = $$(".testimonial-slide", wrap);
    var dotsWrap = $(".testimonial-dots", wrap);
    if (!slides.length) return;
    var current = 0;
    var dots = [];

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Testimonio " + (i + 1));
        b.addEventListener("click", function () { show(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle("is-active", idx === current); });
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === current); });
    }
    show(0);

    if (!reduced) {
      window.setInterval(function () { show(current + 1); }, 6000);
    }
  }

  /* ---------- Hero: parallax sutil con GSAP si está disponible ---------- */
  function initHeroMotion() {
    if (reduced || !window.gsap) return;
    var frame = $(".hero-media-frame img");
    if (frame) {
      gsap.fromTo(frame, { scale: 1.12, y: -18 }, { scale: 1, y: 0, duration: 1.4, ease: "power3.out" });
    }
    var copy = $(".hero-copy");
    if (copy) {
      gsap.fromTo(copy.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, ease: "power3.out", stagger: .08 });
    }
  }

  function initFooterYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Toasts globales ---------- */
  function ensureToastHost() {
    var host = $(".toast");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast";
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }
  function showToast(msg, type) {
    var host = ensureToastHost();
    var item = document.createElement("div");
    item.className = "toast-item" + (type ? " " + type : "");
    item.textContent = msg;
    host.appendChild(item);
    window.setTimeout(function () {
      item.style.transition = "opacity .35s ease";
      item.style.opacity = "0";
      window.setTimeout(function () { item.remove(); }, 400);
    }, 3200);
  }
  window.AuraToast = showToast;

  /* Exige sesión para guardar o enviar solicitudes. Sin sesión, manda a
     iniciar sesión y vuelve a la página actual después de ingresar. */
  window.AuraRequireLogin = function () {
    if (window.AuraStore && window.AuraStore.getSesion()) return true;
    var page = window.location.pathname.split("/").pop() + window.location.search;
    window.location.href = "login.html?aviso=solicitudes&next=" + encodeURIComponent(page);
    return false;
  };

  /* Solo se permite volver a páginas del sitio (evita redirecciones a otros dominios). */
  window.AuraSafeNext = function (fallback) {
    var next = new URLSearchParams(window.location.search).get("next") || "";
    return /^[\w-]+\.html(\?[\w=&%.\-]*)?$/.test(next) ? next : fallback;
  };

  function boot() {
    safe(initHeader, "initHeader");
    safe(initSessionAwareNav, "initSessionAwareNav");
    safe(initReveals, "initReveals");
    safe(initCarousels, "initCarousels");
    safe(initTestimonials, "initTestimonials");
    safe(initFooterYear, "initFooterYear");
    if (window.gsap) {
      safe(initHeroMotion, "initHeroMotion");
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
