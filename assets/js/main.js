// StoneBrook Carpentry — interactions & animations:
// header state, tape-measure progress, mobile menu, scroll reveal + pencil draw-on,
// count-up stats and the service photo stack. The estimate form lives in estimate.js
// and the Our Work dropdown in nav.js (both shared with the inner pages).

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const header = document.querySelector('.site-header');
  const blade = document.querySelector('.tape-blade');

  // ---- Scroll: header shadow, tape blade ----
  let ticking = false;
  // Page width without the scrollbar (Windows scrollbars take ~17px that 100vw includes)
  const setPageW = () => document.documentElement.style.setProperty('--page-w', `${document.documentElement.clientWidth}px`);
  setPageW();
  addEventListener('resize', setPageW);

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('scrolled', y > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      const room = innerWidth - 8;
      blade.style.width = `${(max > 0 ? y / max : 0) * room}px`;
      ticking = false;
    });
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // ---- Logo: back to the top of the homepage ----
  document.querySelectorAll('a.brand, a.brand-top').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }));

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

  // ---- Count-up numbers ----
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce) { el.textContent = end; return; }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---- Reviews: split the handwriting into words so it can be "written" in ----
  const reviewSheets = [...document.querySelectorAll('.review.notepad')];
  if (!reduce) {
    reviewSheets.forEach((sheet) => {
      const q = sheet.querySelector('blockquote');
      q.innerHTML = q.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    });
  }
  const writeReview = (sheet) => {
    const words = [...sheet.querySelectorAll('.w')];
    const start = (parseFloat(getComputedStyle(sheet).getPropertyValue('--d')) || 0) * 1000 + 950;
    words.forEach((w, i) => setTimeout(() => w.classList.add('on'), start + i * 55));
    setTimeout(() => sheet.classList.add('written', 'settled'), start + words.length * 55 + 200);
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
    if (el.classList.contains('notepad') && el.classList.contains('review')) writeReview(el);
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

  // ---- Services: a stack of photos ----
  // Moving down the list slides each new photo on top of the pile; moving back up
  // slides the top photos off again.
  const svcMedia = document.querySelector('.svc-media');
  const svcs = [...document.querySelectorAll('.svc')];
  const tilts = [-2.5, 2, -1.2, 2.6, -2, 1.4];
  svcMedia.innerHTML = '';
  const photos = svcs.map((b, i) => {
    const img = document.createElement('img');
    img.className = 'stack-photo' + (i === 0 ? ' in' : '');
    img.src = b.dataset.img;
    img.alt = b.dataset.alt;
    img.style.setProperty('--tilt', `${tilts[i % tilts.length]}deg`);
    img.style.zIndex = i + 1;
    svcMedia.appendChild(img);
    return img;
  });
  let svcActive = 0;
  const activate = (btn) => {
    const n = svcs.indexOf(btn);
    if (n === svcActive) return;
    svcs.forEach((b) => b.classList.toggle('active', b === btn));
    const goingUp = n > svcActive;
    photos.forEach((ph, i) => {
      const on = i <= n;
      if (on === ph.classList.contains('in')) return;
      // stagger when jumping several items at once
      const delay = goingUp ? (i - svcActive - 1) * 90 : (svcActive - i) * 90;
      ph.style.transitionDelay = `${Math.max(0, delay)}ms`;
      ph.classList.toggle('in', on);
    });
    svcActive = n;
  };
  svcs.forEach((btn) => {
    btn.addEventListener('mouseenter', () => activate(btn));
    btn.addEventListener('focus', () => activate(btn));
    btn.addEventListener('click', () => activate(btn));
  });

  // =====================================================================
  // Mobile-only behaviour (desktop is unaffected)
  // =====================================================================
  const mobile = matchMedia('(max-width: 860px)');

  // "Hiring a contractor" / About photos: wipe in once the photo is properly on screen
  if ('IntersectionObserver' in window) {
    const wipeIO = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('m-in'); wipeIO.unobserve(e.target); }
    }), { threshold: 0.35 });
    document.querySelectorAll('.split .wipe').forEach((w) => wipeIO.observe(w));
  }

  // "What we build": tabs above the photo pile on phones (desktop keeps the hover list)
  const svcTabs = document.createElement('div');
  svcTabs.className = 'svc-tabs';
  svcTabs.setAttribute('role', 'tablist');
  const svcDesc = document.createElement('div');
  svcDesc.className = 'svc-desc';
  svcDesc.setAttribute('aria-live', 'polite');
  const tabLabels = ['Decks & Porches', 'Tile', 'Kitchens & Baths', 'Basements', 'Additions', 'Repairs'];
  const showDesc = (b) => {
    svcDesc.innerHTML = `<div class="swap"><strong>${b.querySelector('strong').textContent}</strong><p>${b.querySelector('span').textContent}</p></div>`;
  };
  svcs.forEach((b, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'svc-tab' + (i === 0 ? ' on' : '');
    t.setAttribute('role', 'tab');
    t.textContent = tabLabels[i] || b.querySelector('strong').textContent;
    t.addEventListener('click', () => {
      svcTabs.querySelectorAll('.svc-tab').forEach((x) => x.classList.toggle('on', x === t));
      svcTabs.scrollTo({ left: t.offsetLeft - (svcTabs.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      activate(b);
      showDesc(b);
    });
    svcTabs.appendChild(t);
  });
  document.querySelector('.svc-list h2').after(svcTabs);
  svcMedia.after(svcDesc);
  showDesc(svcs[0]);

  // Reviews: swipeable notes with dots
  const rGrid = document.querySelector('.reviews .review-grid');
  const dots = document.createElement('div');
  dots.className = 'review-dots';
  reviewSheets.forEach((sheet, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', `Show review ${i + 1}`);
    d.addEventListener('click', () => rGrid.scrollTo({ left: sheet.offsetLeft - (rGrid.clientWidth - sheet.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }));
    dots.appendChild(d);
  });
  rGrid.after(dots);
  const markDot = () => {
    const mid = rGrid.scrollLeft + rGrid.clientWidth / 2;
    let best = 0, bestD = Infinity;
    reviewSheets.forEach((sheet, i) => {
      const d = Math.abs(sheet.offsetLeft + sheet.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
  };
  rGrid.addEventListener('scroll', markDot, { passive: true });
  markDot();

  // Phone bar: tuck it away while the estimate form is on screen so it never covers the form
  const mBar = document.querySelector('.m-bar');
  if (mBar && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => mBar.classList.toggle('away', e.isIntersecting)), { threshold: 0.15 })
      .observe(document.getElementById('estimate'));
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
