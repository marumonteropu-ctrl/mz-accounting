'use strict';
// Carrito de cursos: se guarda en el navegador de cada visitante y se paga todo junto.
(function () {
  const CLAVE = 'mz_carrito';
  const P = window.MZ_PRODUCTOS || {};
  const enlace = document.getElementById('url-carrito');
  const URL_CARRITO = enlace ? enlace.getAttribute('href') : '#';

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pesos = (n) => '$' + Math.round(n).toLocaleString('es-AR');

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '[]').filter((id) => P[id]); } catch (e) { return []; }
  }
  function guardar(c) {
    try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { /* sin almacenamiento: el carrito dura esta visita */ }
    memoria = c;
    pintarCuenta();
    pintarCarrito();
  }
  let memoria = leer();
  const actual = () => { const c = leer(); return c.length || !memoria.length ? c : memoria; };

  const cursosDe = (c) => new Set(c.flatMap((id) => P[id].cursos));
  const esSuelto = (id) => P[id].cursos.length === 1 && !P[id].combo;

  function aviso(html) {
    let el = document.querySelector('.carrito-aviso');
    if (!el) { el = document.createElement('div'); el.className = 'carrito-aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = html;
    el.classList.add('visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('visible'), 3500);
  }

  function agregar(id) {
    const c = actual();
    if (!P[id]) return;
    if (c.includes(id)) { aviso('Ya está en tu carrito. <a href="' + URL_CARRITO + '">Ver carrito</a>'); return; }
    const yaTiene = cursosDe(c);
    if (!P[id].combo && P[id].cursos.every((x) => yaTiene.has(x))) {
      aviso('Ese curso ya está incluido en tu carrito. <a href="' + URL_CARRITO + '">Ver carrito</a>'); return;
    }
    // Si suma un recorrido o el pack, saca los cursos sueltos que ya trae incluidos
    let resto = c;
    if (P[id].cursos.length > 1) resto = c.filter((x) => !(esSuelto(x) && P[id].cursos.includes(P[x].cursos[0])));
    resto = resto.concat(id);
    guardar(resto);
    aviso('Agregaste <strong>' + esc(P[id].nombre) + '</strong>. <a href="' + URL_CARRITO + '">Ver carrito (' + resto.length + ')</a>');
  }

  function quitar(id) { guardar(actual().filter((x) => x !== id)); }

  function sugerencia(c) {
    // ¿Conviene cambiar cursos sueltos por un recorrido o por el pack completo?
    const sueltos = c.filter(esSuelto);
    const tiene = new Set(sueltos.map((x) => P[x].cursos[0]));
    const packs = Object.keys(P).filter((k) => P[k].cursos.length > 1 && !c.includes(k))
      .sort((a, b) => P[b].cursos.length - P[a].cursos.length);
    for (const k of packs) {
      const cubre = sueltos.filter((x) => P[k].cursos.includes(P[x].cursos[0]));
      const suma = cubre.reduce((t, x) => t + P[x].precio, 0);
      if (P[k].cursos.every((x) => tiene.has(x)) && suma > P[k].precio) {
        return { pack: k, saca: cubre, texto: 'Te conviene <strong>' + esc(P[k].nombre) + '</strong>: ahorrás ' + pesos(suma - P[k].precio) + '.' };
      }
      if (k === 'pack-completo' && suma >= P[k].precio) {
        return { pack: k, saca: cubre, texto: 'Con lo que llevás ya pagás más que el <strong>' + esc(P[k].nombre) + '</strong> (' + pesos(P[k].precio) + '), que trae los 6 cursos.' };
      }
    }
    return null;
  }

  function pintarCuenta() {
    const n = actual().length;
    document.querySelectorAll('[data-carrito-cuenta]').forEach((e) => { e.textContent = n; e.hidden = n === 0; });
  }

  function pintarCarrito() {
    const lista = document.getElementById('carrito-lista');
    if (!lista) return;
    const c = actual();
    const vacio = document.getElementById('carrito-vacio');
    const pago = document.getElementById('carrito-pago');
    vacio.hidden = c.length > 0;
    pago.hidden = c.length === 0;
    lista.innerHTML = c.map((id) => {
      const p = P[id];
      const detalle = p.cursos.length > 1 ? p.cursos.length + ' cursos en PDF' : (p.combo ? 'Curso en PDF + clase de 60 minutos' : 'Curso en PDF');
      return '<li class="carrito-item"><div><p class="carrito-nombre">' + esc(p.nombre) + '</p><p class="carrito-detalle">' + detalle +
        '</p></div><span class="carrito-precio">' + pesos(p.precio) + '</span><button type="button" class="carrito-quitar" data-quitar="' + esc(id) +
        '" aria-label="Quitar ' + esc(p.nombre) + '">Quitar</button></li>';
    }).join('');
    const total = c.reduce((t, id) => t + P[id].precio, 0);
    document.getElementById('carrito-total').textContent = pesos(total);
    document.getElementById('carrito-producto').value = 'carrito:' + c.join(',');
    const caja = document.getElementById('carrito-sugerencia');
    const s = sugerencia(c);
    caja.hidden = !s;
    if (s) {
      caja.innerHTML = '<p>' + s.texto + '</p><button type="button" class="btn btn-primary btn-sm" id="carrito-cambiar">Cambiar por el ' +
        (s.pack === 'pack-completo' ? 'pack' : 'recorrido') + '</button>';
      document.getElementById('carrito-cambiar').onclick = () => guardar(actual().filter((x) => !s.saca.includes(x)).concat(s.pack));
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-agregar]');
    if (a) { e.preventDefault(); agregar(a.dataset.agregar); return; }
    const q = e.target.closest('[data-quitar]');
    if (q) { e.preventDefault(); quitar(q.dataset.quitar); }
  });
  window.addEventListener('storage', () => { memoria = leer(); pintarCuenta(); pintarCarrito(); });
  pintarCuenta();
  pintarCarrito();
})();
