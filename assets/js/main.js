// StoneBrook Carpentry — interactions & animations:
// header state, tape-measure progress, mobile menu, scroll reveal + pencil draw-on,
// count-up stats, pinned sketch→photo scrub, service image swap, filterable gallery
// with lightbox, and a placeholder estimate form handler.

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const header = document.querySelector('.site-header');
  const blade = document.querySelector('.tape-blade');

  // ---- Pinned sketch → photo scrub ----
  // The stage is sticky inside a tall track, so the slider only moves while the
  // photo sits centered on screen.
  const track = document.getElementById('vision-track');
  const ba = document.getElementById('sketch-reveal');
  const note = document.querySelector('.reveal-note');
  const setP = (p) => ba.style.setProperty('--p', clamp(p).toFixed(4));
  const scrub = () => {
    if (!track) return;
    const r = track.getBoundingClientRect();
    const stage = track.firstElementChild.offsetHeight;
    const t = clamp(-r.top / Math.max(1, r.height - stage));
    // Hold on the sketch briefly, slide, then hold on the finished photo before the
    // page moves on, so it pauses at both ends (scrolling down or back up).
    const e = clamp((t - 0.12) / 0.6);
    setP(0.97 - 0.94 * e);
    note.classList.toggle('done', e > 0.95);
  };
  if (ba) {
    if (reduce) setP(0.5);
    // Dragging also works; the next scroll picks back up from the scroll position.
    const drag = (e) => {
      const r = ba.getBoundingClientRect();
      setP((e.clientX - r.left) / r.width);
    };
    ba.addEventListener('pointerdown', (e) => { drag(e); ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', (e) => { if (e.buttons) drag(e); });
  }

  // ---- Scroll: header shadow, tape blade, scrub ----
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
      if (!reduce) scrub();
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

  // ---- Gallery: category covers + scrolling row ----
  const track2 = document.getElementById('gallery-track');
  const items = [...track2.querySelectorAll('.g')];
  const prev = document.querySelector('.car-prev');
  const next = document.querySelector('.car-next');
  const filters = document.querySelectorAll('.filter');
  const updateNav = () => {
    prev.disabled = track2.scrollLeft < 8;
    next.disabled = track2.scrollLeft + track2.clientWidth > track2.scrollWidth - 8;
  };
  const setFilter = (cat) => {
    filters.forEach((o) => {
      const on = o.dataset.filter === cat;
      o.classList.toggle('active', on);
      o.setAttribute('aria-pressed', String(on));
    });
    items.forEach((g) => {
      const show = g.dataset.cat === cat;   // "all" shows the category covers
      g.classList.toggle('hide', !show);
      g.classList.remove('fade-in');
      if (show && !reduce) { void g.offsetWidth; g.classList.add('fade-in'); }
    });
    track2.scrollLeft = 0;
    updateNav();
  };
  filters.forEach((f) => f.addEventListener('click', () => setFilter(f.dataset.filter)));
  const step = () => track2.clientWidth * 0.8;
  prev.addEventListener('click', () => track2.scrollBy({ left: -step() }));
  next.addEventListener('click', () => track2.scrollBy({ left: step() }));
  track2.addEventListener('scroll', updateNav, { passive: true });
  addEventListener('resize', updateNav);
  updateNav();

  // ---- Lightbox with previous / next (project photos only, not the covers) ----
  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('.lightbox-caption');
  let current = 0;
  const visible = () => items.filter((g) => !g.classList.contains('hide') && !g.classList.contains('cover'));
  const show = (i) => {
    const list = visible();
    current = (i + list.length) % list.length;
    const g = list[current];
    const img = g.querySelector('img');
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = g.dataset.caption || '';
  };
  items.forEach((g) => g.addEventListener('click', () => {
    if (g.classList.contains('cover')) { setFilter(g.dataset.goto); return; }
    show(visible().indexOf(g));
    box.showModal();
  }));
  box.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  box.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // ---- Estimate: quick form, with the Project Planner as an optional step-by-step version ----
  // No backend yet: connect both forms to the client's form service before launch.
  const quick = document.querySelector('.quick-form');
  const quickNote = quick.querySelector('.form-note');
  quick.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = quick.elements.name.value.trim();
    const phone = quick.elements.phone.value.trim();
    if (!name || !phone) {
      quickNote.textContent = 'Please add your name and phone number so we can reach you.';
      return;
    }
    quickNote.textContent = `Thanks, ${name.split(' ')[0]}. We'll be in touch soon to talk through your project.`;
    quick.reset();
  });
  const form = document.querySelector('.planner');
  const qs = [...form.querySelectorAll('.q')];
  const blade2 = form.querySelector('.meter-blade');
  const mLabel = form.querySelector('.meter-label');
  const pNext = form.querySelector('.p-next');
  const pBack = form.querySelector('.p-back');
  const pNav = form.querySelector('.planner-nav');
  const formNote = form.querySelector('.form-note');
  const answers = {};
  let stepI = 0;
  const expectFor = {
    'Deck or porch': 'We check footings, ledger and framing first. What holds it up matters more than the boards on top.',
    'Bathroom or tile': 'Everything behind the tile is waterproofed and checked before a single tile goes up.',
    'Kitchen': 'We plan the order of work so you keep as much of your kitchen usable as possible.',
    'Basement': 'We look at moisture and egress up front so the finished space stays dry and safe.',
    'Addition or exterior': 'We tie the new work into the existing house so it looks like it was always there.',
    'Repair': 'We find the cause, not just the symptom, and show you photos of what we find.'
  };
  const careNote = {
    'A clear price with no surprises': 'A written quote we walk through line by line. Any change is approved by you first.',
    'Minimal disruption to daily life': 'A schedule built around your routine, with work areas closed off.',
    'A clean jobsite': 'The site is cleaned up at the end of every day.',
    'Low-maintenance, long-lasting materials': 'Material options compared for durability and upkeep, not just looks.',
    'Regular updates': 'Regular updates, so you always know what is happening.',
    'Help picturing the finished space': 'Examples of similar finished projects at your visit.'
  };
  const buildPlan = () => {
    const rows = [['Project', answers.type], ['Size', answers.size], ['Timing', answers.when], ['Priorities', (answers.care || []).join('; ')]];
    form.querySelector('.plan-list').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v || 'Not chosen'}</dd>`).join('');
    const care = answers.care || [];
    const items = [
      'A free visit: Gary comes out, listens, and looks closely at the space.',
      expectFor[answers.type],
      ...care.map((c) => careNote[c]),
      care.includes('A clear price with no surprises') ? null : 'A written quote you review together, at your pace.'
    ].filter(Boolean);
    form.querySelector('.plan-expect').innerHTML = items.map((t) => `<li>${t}</li>`).join('');
  };
  const renderStep = () => {
    qs.forEach((q, i) => q.classList.toggle('on', i === stepI));
    blade2.style.width = `${(stepI / (qs.length - 1)) * 100}%`;
    mLabel.textContent = `Step ${stepI + 1} of ${qs.length}`;
    pBack.disabled = stepI === 0;
    const last = stepI === qs.length - 1;
    pNext.style.display = last ? 'none' : '';
    const key = qs[stepI].dataset.key;
    pNext.disabled = !last && !(answers[key] && answers[key].length);
    if (last) buildPlan();
  };
  const go = (d) => { stepI = clamp(stepI + d, 0, qs.length - 1); renderStep(); };
  qs.forEach((q) => {
    const single = q.hasAttribute('data-single');
    q.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => {
      const key = q.dataset.key;
      if (single) {
        q.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === o));
        answers[key] = o.dataset.v;
        renderStep();
        setTimeout(() => { if (qs[stepI] === q) go(1); }, 320);
      } else {
        o.classList.toggle('sel');
        answers[key] = [...q.querySelectorAll('.opt.sel')].map((x) => x.dataset.v);
        renderStep();
      }
    }));
  });
  pNext.addEventListener('click', () => go(1));
  pBack.addEventListener('click', () => go(-1));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    if (!name || !phone) {
      formNote.textContent = 'Please add your name and phone number so we can reach you.';
      return;
    }
    qs[stepI].classList.remove('on');
    pNav.classList.add('hide');
    blade2.style.width = '100%';
    mLabel.textContent = 'Sent';
    formNote.textContent = '';
    const done = document.createElement('div');
    done.className = 'q on';
    done.innerHTML = `<p class="planner-done"><strong>Thanks, ${name.split(' ')[0]}.</strong> Your project plan is on its way to Gary. He'll call you to set up a time to see the space.</p>`;
    form.appendChild(done);
  });
  renderStep();

  // Swap between the quick form and the planner
  const swapTo = (show, hide) => {
    hide.hidden = true;
    show.hidden = false;
    const top = show.getBoundingClientRect().top;
    if (top < 80) scrollBy({ top: top - 100, behavior: reduce ? 'auto' : 'smooth' });
  };
  quick.querySelector('.open-planner').addEventListener('click', () => swapTo(form, quick));
  form.querySelector('.close-planner').addEventListener('click', () => swapTo(quick, form));

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

  // "What we build": the list item passing under the pinned photo becomes active
  let svcTick = false;
  const svcFromScroll = () => {
    if (!mobile.matches || svcTick) return;
    svcTick = true;
    requestAnimationFrame(() => {
      const media = svcMedia.getBoundingClientRect();
      const line = media.bottom + 40;            // just below the pinned photo
      let pick = svcs[0];
      svcs.forEach((b) => { if (b.getBoundingClientRect().top <= line) pick = b; });
      activate(pick);
      svcTick = false;
    });
  };
  addEventListener('scroll', svcFromScroll, { passive: true });

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

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
