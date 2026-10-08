// StoneBrook Carpentry — small interactions: sticky header state, mobile menu,
// scroll reveal, gallery lightbox, and a placeholder estimate form handler.

(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Scroll reveal
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Lightbox
  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('.lightbox-caption');
  document.querySelectorAll('.g-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      boxImg.src = btn.dataset.full;
      boxImg.alt = btn.querySelector('img').alt;
      boxCap.textContent = btn.dataset.caption || '';
      box.showModal();
    });
  });
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });

  // Estimate form — no backend yet. Hook up to the form service before launch.
  const form = document.querySelector('.estimate-form');
  const note = form.querySelector('.form-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    if (!name || !phone) {
      note.textContent = 'Please add your name and phone number so we can reach you.';
      return;
    }
    note.textContent = `Thanks, ${name.split(' ')[0]}. We'll be in touch soon to talk through your project.`;
    form.reset();
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
