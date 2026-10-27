// StoneBrook Carpentry — shared behaviour for the inner pages (projects, free estimate,
// legal pages, 404): header shadow, tape-measure progress, mobile menu, pencil marks,
// scroll reveal, the phone call/estimate bar and the footer year.
// The homepage does the same things in main.js alongside its own sections.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const blade = document.querySelector('.tape-blade');

  // ---- Scroll: header shadow, tape blade ----
  const setPageW = () => document.documentElement.style.setProperty('--page-w', `${document.documentElement.clientWidth}px`);
  setPageW();
  addEventListener('resize', setPageW);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('scrolled', y > 8);
      if (blade) {
        const max = document.documentElement.scrollHeight - innerHeight;
        blade.style.width = `${(max > 0 ? y / max : 0) * (innerWidth - 8)}px`;
      }
      ticking = false;
    });
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // ---- Mobile menu ----
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ---- Pencil texture: a faint second pass on every mark ----
  document.querySelectorAll('svg.pencil').forEach((svg) => {
    [...svg.children].forEach((mark) => {
      const ghost = mark.cloneNode(true);
      ghost.classList.add('ghost');
      svg.appendChild(ghost);
    });
  });

  // ---- Reveal + pencil draw-on ----
  const targets = new Set([
    ...document.querySelectorAll('[data-reveal]'),
    ...[...document.querySelectorAll('svg.pencil')].map((s) => s.parentElement),
  ]);
  const reveal = (el) => el.classList.add('in', 'drawn');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach(reveal);
  }

  // ---- Phone bar: tuck it away while the estimate form is on screen ----
  const mBar = document.querySelector('.m-bar');
  const estimate = document.getElementById('estimate');
  if (mBar && estimate && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => mBar.classList.toggle('away', e.isIntersecting)), { threshold: 0.15 })
      .observe(estimate);
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
