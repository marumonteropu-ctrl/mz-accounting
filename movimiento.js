'use strict';
// Entradas animadas: fotos con efecto cortina y bloques que suben al aparecer en pantalla.
(function () {
  var raiz = document.documentElement;
  if (!raiz.classList.contains('mov')) return;
  window.MZ_MOV = true;
  var cortina = ['.portrait img', '.nosotras-foto img', '.advisor img', '.card-portada img', '.muestra img', '.ac-hero img'];
  var sube = ['.portrait figcaption', '.section-head', '.caso', '.plataformas', '.service-list details', '.teaser-list li', '.academy-teaser .button',
    '.trabajo-pasos .trabajo-titulo', '.ruta .card', '.barra-ruta', '.aviso-ri', '.capacitacion', '.faq details', '.benef', '.pestanas'];
  function marcar(lista, attr) {
    lista.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.hasAttribute('data-cortina') || el.hasAttribute('data-sube')) return;
        el.setAttribute(attr, '');
      });
    });
  }
  marcar(cortina, 'data-cortina');
  marcar(sube, 'data-sube');
  // Escalonado: cada hermano animado entra un poco después que el anterior
  document.querySelectorAll('[data-cortina],[data-sube]').forEach(function (el) {
    var hermanos = Array.prototype.filter.call(el.parentElement.children, function (h) { return h.hasAttribute('data-sube') || h.hasAttribute('data-cortina') || h.querySelector('[data-cortina]'); });
    var i = Math.max(0, hermanos.indexOf(el));
    if (el.matches('.portrait img')) i = el.closest('.zulma') ? 2 : 0;
    if (el.matches('.portrait figcaption')) i = el.closest('.zulma') ? 6 : 4;
    el.style.setProperty('--retraso', Math.min(i, 6) * 0.1 + 's');
  });
  function mostrar(el) {
    if (el.classList.contains('visible')) return;
    el.classList.add('visible');
    obs.unobserve(el);
    if (el.matches('.portrait img, .advisor img')) setTimeout(function () { el.classList.add('listo'); }, 1900);
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) { if (e.isIntersecting) mostrar(e.target); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  var pendientes = Array.prototype.slice.call(document.querySelectorAll('[data-cortina],[data-sube]'));
  pendientes.forEach(function (el) { obs.observe(el); });
  // Respaldo: lo que ya quedó arriba o dentro de la pantalla aparece aunque se haya bajado muy rápido
  var esperando = false;
  function revisar() {
    esperando = false;
    var alto = window.innerHeight;
    pendientes = pendientes.filter(function (el) {
      if (el.classList.contains('visible')) return false;
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return true;
      if (r.top < alto * 0.95) { mostrar(el); return false; }
      return true;
    });
  }
  window.addEventListener('scroll', function () { if (!esperando) { esperando = true; setTimeout(revisar, 80); } }, { passive: true });
  window.addEventListener('resize', revisar);
  document.addEventListener('click', function () { setTimeout(revisar, 50); });
  revisar();
})();
