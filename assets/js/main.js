// StoneBrook Carpentry — interactions & animations:
// header state, tape-measure progress, mobile menu, scroll reveal + pencil draw-on,
// count-up stats, sketch→photo scrub, service image swap, punch-list checks,
// lightbox, and a placeholder estimate form handler.

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const tape = document.querySelector('.tape-fill');

  // ---- Sketch → photo scrub (scroll-driven, also draggable) ----
  const ba = document.getElementById('sketch-reveal');
  let baDragged = false;
  const setP = (p) => ba && ba.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
  const scrubFromScroll = () => {
    if (!ba || baDragged || reduce) return;
    const r = ba.getBoundingClientRect();
    const vh = innerHeight;
    // 0 when the image enters low in the viewport, 1 when its middle reaches the upper third
    const t = (vh * 0.85 - r.top) / (vh * 0.85 - vh * 0.33 + r.height / 2);
    setP(0.92 - 0.84 * Math.min(1, Math.max(0, t)));
  };
  if (ba) {
    setP(reduce ? 0.5 : 0.92);
    const drag = (e) => {
      const r = ba.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      baDragged = true;
      setP(x / r.width);
    };
    ba.addEventListener('pointerdown', (e) => { drag(e); ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', (e) => { if (e.buttons) drag(e); });
  }

  // ---- Scroll: header shadow, tape progress, scrub ----
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('scrolled', y > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      tape.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      scrubFromScroll();
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

  // ---- Pencil texture: add a faint second pass to every mark ----
  document.querySelectorAll('svg.pencil').forEach((svg) => {
    [...svg.children].forEach((mark) => {
      const ghost = mark.cloneNode(true);
      ghost.classList.add('ghost');
      svg.appendChild(ghost);
    });
  });

  // ---- Punch list: stagger the pencil checks ----
  document.querySelectorAll('.punch li .pencil').forEach((svg, i) => {
    svg.style.transitionDelay = `${0.5 + i * 0.35}s`;
    svg.style.transitionDuration = '.6s';
  });

  // ---- Count-up numbers ----
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce) { el.textContent = end; return; }
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---- Reveal + pencil draw-on ----
  const targets = new Set([
    ...document.querySelectorAll('[data-reveal]'),
    ...[...document.querySelectorAll('svg.pencil')].map((s) => s.parentElement),
  ]);
  // A clip-path wipe starts fully clipped, which the observer can treat as not visible,
  // so watch its parent and reveal the wipe from there.
  document.querySelectorAll('.wipe').forEach((w) => { targets.delete(w); targets.add(w.parentElement); });
  const reveal = (el) => {
    el.classList.add('in', 'drawn');
    el.querySelectorAll(':scope > .wipe').forEach((w) => w.classList.add('in'));
    el.querySelectorAll('[data-count]').forEach(countUp);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach(reveal);
  }

  // ---- Services: swap the photo on hover / tap ----
  const svcImg = document.querySelector('.svc-img');
  const svcs = document.querySelectorAll('.svc');
  // Preload so the swap is instant
  svcs.forEach((b) => { const i = new Image(); i.src = b.dataset.img; });
  const activate = (btn) => {
    if (btn.classList.contains('active')) return;
    svcs.forEach((b) => b.classList.toggle('active', b === btn));
    svcImg.classList.add('swap');
    setTimeout(() => {
      svcImg.src = btn.dataset.img;
      svcImg.alt = btn.dataset.alt;
      svcImg.classList.remove('swap');
    }, 220);
  };
  svcs.forEach((btn) => {
    btn.addEventListener('mouseenter', () => activate(btn));
    btn.addEventListener('focus', () => activate(btn));
    btn.addEventListener('click', () => activate(btn));
  });

  // ---- Lightbox for work cards ----
  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('.lightbox-caption');
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      boxImg.src = card.dataset.full;
      boxImg.alt = card.querySelector('img').alt;
      boxCap.textContent = card.dataset.caption || '';
      box.showModal();
    });
  });
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });

  // ---- Estimate form (no backend yet — connect to the client's form service before launch) ----
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
