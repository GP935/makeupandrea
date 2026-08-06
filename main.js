// Makeup Andrea — main.js (module, defer)
// Sitio de servicios (novias + clases): sin carrito, sin buscador, sin catálogo, sin Stripe.
// Menú móvil adaptado de andreaapbeauty (mismo contrato de IDs/clases, sin dropdown SERVICIOS).

// 1 · Menú móvil — panel deslizante + backdrop
function initMobileMenu() {
  const btnMenu = document.getElementById('btn-menu');
  const panel = document.getElementById('menu-panel');
  const backdrop = document.getElementById('menu-backdrop');
  const btnClose = document.getElementById('btn-menu-close');
  if (!btnMenu || !panel || !backdrop) return;

  function open() {
    backdrop.removeAttribute('hidden');
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    btnMenu.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (btnClose) btnClose.focus();
  }

  function close() {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    btnMenu.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    btnMenu.focus();

    // Devolver `hidden` al backdrop tras la transición (con fallback si no se dispara)
    let restored = false;
    const restore = () => {
      if (restored || backdrop.classList.contains('is-open')) return;
      restored = true;
      backdrop.setAttribute('hidden', '');
    };
    backdrop.addEventListener('transitionend', restore, { once: true });
    setTimeout(restore, 400);
  }

  btnMenu.addEventListener('click', open);
  if (btnClose) btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  // Cerrar al pulsar un enlace de navegación del panel
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });
}

// 2 · Carrusel "Quién soy" — 2 slides, mecánica show/hide vía .is-active (MA-J2)
function initQuienSoyCarrusel() {
  const root = document.getElementById('quien-soy-carrusel');
  const track = document.getElementById('carrusel-track');
  const prev = document.getElementById('carrusel-prev');
  const next = document.getElementById('carrusel-next');
  const dotsWrap = document.getElementById('carrusel-dots');
  if (!root || !track || !prev || !next || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll('.carrusel__slide'));
  const dots = Array.from(dotsWrap.querySelectorAll('.carrusel__dot'));
  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  function goTo(index) {
    const target = (index + slides.length) % slides.length;
    if (target === current) return;

    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    slides[target].classList.add('is-active');
    slides[target].setAttribute('aria-hidden', 'false');
    dots[target].classList.add('is-active');
    dots[target].setAttribute('aria-selected', 'true');

    current = target;
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Swipe táctil
  let touchStartX = null;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) goTo(diff < 0 ? current + 1 : current - 1);
    touchStartX = null;
  }, { passive: true });
}

// 2b · Carrusel de galería — mismo mecanismo show/hide, IDs propios (moldes normal/reflejo)
function initGaleriaCarrusel() {
  const root = document.getElementById('galeria-carrusel');
  const track = document.getElementById('galeria-track');
  const prev = document.getElementById('galeria-prev');
  const next = document.getElementById('galeria-next');
  const dotsWrap = document.getElementById('galeria-dots');
  if (!root || !track || !prev || !next || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll('.galeria-slide'));
  const dots = Array.from(dotsWrap.querySelectorAll('.carrusel__dot'));
  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  function goTo(index) {
    const target = (index + slides.length) % slides.length;
    if (target === current) return;
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    slides[target].classList.add('is-active');
    slides[target].setAttribute('aria-hidden', 'false');
    dots[target].classList.add('is-active');
    dots[target].setAttribute('aria-selected', 'true');
    current = target;
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let touchStartX = null;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) goTo(diff < 0 ? current + 1 : current - 1);
    touchStartX = null;
  }, { passive: true });
}

// 3 · Reveals al scroll — alcance mínimo (MA-J3, briefing v2 §10.4)
// Contrato con css (style.css ~L77-87): JS agrega la clase "reveal" (no está en el HTML,
// así el sitio se ve completo si este script no corre) y alterna "is-visible" una sola vez
// vía IntersectionObserver. Selección explícita de elementos repetibles (cards/items/bloques)
// + eyebrow/section-title por sección, con stagger leve entre elementos de la misma sección.
// Fuera de alcance a propósito: hero (`.hero-eyebrow`, no `.eyebrow`), carrusel `#quien-soy-carrusel`
// (ya anima su propio cambio de slide) y `.faq__item` (acordeón nativo `<details>`, sin JS).
function initScrollReveals() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealSelector = [
    '.eyebrow', '.section-title',
    '.galeria__item', '.galeria-novias__item',
    '.resena-item', '.servicio-card', '.selector-card',
    '.formacion__bloque', '.paquete-bloque',
    '.credencial-item', '.resenas__stat',
  ].join(', ');

  const targets = [];
  document.querySelectorAll('section').forEach((section) => {
    section.querySelectorAll(revealSelector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
      targets.push(el);
    });
  });
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => observer.observe(el));
}

// 4 · Año dinámico del footer
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

initMobileMenu();
initQuienSoyCarrusel();
initGaleriaCarrusel();
initScrollReveals();
initFooterYear();
