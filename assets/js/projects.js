// StoneBrook Carpentry — Projects page: header state, mobile menu, category filter
// (deep-linkable with #decks-porches etc.), and a photo lightbox with previous/next.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

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

  // Category filter. Every section stays in the HTML (good for search engines);
  // the tabs just show one category at a time.
  const tabs = [...document.querySelectorAll('.ptab')];
  const cats = [...document.querySelectorAll('.pcat')];
  const tabRow = document.querySelector('.ptabs');
  const setCat = (cat, scroll) => {
    if (!cats.some((c) => c.dataset.cat === cat)) cat = 'all';
    tabs.forEach((t) => {
      const on = t.dataset.cat === cat;
      t.classList.toggle('on', on);
      t.setAttribute('aria-current', on ? 'true' : 'false');
      if (on) tabRow.scrollTo({ left: t.offsetLeft - (tabRow.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    });
    cats.forEach((c) => {
      c.hidden = cat !== 'all' && c.dataset.cat !== cat;
      if (!c.hidden && !reduce) c.querySelectorAll('.pshot').forEach((f) => { f.classList.remove('fade-in'); void f.offsetWidth; f.classList.add('fade-in'); });
    });
    if (scroll) {
      const top = document.querySelector('.ptabs-bar').getBoundingClientRect().top + scrollY - header.offsetHeight;
      scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    }
  };
  tabs.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    history.replaceState(null, '', t.dataset.cat === 'all' ? location.pathname : '#' + t.dataset.cat);
    setCat(t.dataset.cat, true);
  }));
  const fromHash = () => setCat(location.hash.slice(1) || 'all', !!location.hash);
  fromHash();
  addEventListener('hashchange', fromHash);

  // Lightbox (previous / next within what's currently shown)
  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('.lightbox-caption');
  const shots = [...document.querySelectorAll('.pshot')];
  let current = 0;
  const visible = () => shots.filter((f) => !f.closest('.pcat').hidden);
  const show = (i) => {
    const list = visible();
    current = (i + list.length) % list.length;
    const img = list[current].querySelector('img');
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = list[current].querySelector('figcaption').textContent;
  };
  shots.forEach((f) => f.querySelector('.pshot-btn').addEventListener('click', () => { show(visible().indexOf(f)); box.showModal(); }));
  box.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  box.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
