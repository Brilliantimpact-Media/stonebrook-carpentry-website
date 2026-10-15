// StoneBrook Carpentry — interactions & animations:
// header state, tape-measure progress, mobile menu, scroll reveal + pencil draw-on,
// count-up stats, service photo stack, and the estimate form with a built-in
// Project Planner (follow-up questions tailored to the chosen project).

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

  // ---- Estimate form: contact first, then the Project Planner ----
  // Step 1 is name/phone/email/town (they can send right there). Then the project type,
  // follow-up questions tailored to it, timing, priorities, and a final summary + notes.
  // Contact info sits above the planner. The project-type step has a "Just send my info" tile; every follow-up question has an "Other" option; picking it asks for details on the last step.
  // No backend yet: connect to the client's form service before launch.
  const form = document.querySelector('.planner');
  const typeStep = form.querySelector('.q[data-key="type"]');
  const finalStep = form.querySelector('.q-final');
  const blade2 = form.querySelector('.meter-blade');
  const mLabel = form.querySelector('.meter-label');
  const pNext = form.querySelector('.p-next');
  const pBack = form.querySelector('.p-back');
  const formNote = form.querySelector('.form-note');
  const contactBlock = form.querySelector('.contact-block');
  const finalLabel = form.querySelector('.final-label');
  const opt = (v, sub = '') => ({ v, sub });
  const OTHER = opt('Other', 'Tell us at the end');
  const FLOW = {
    'Deck or porch': [
      { key: 'scope', label: 'Type', q: 'What kind of deck or porch project?', opts: [opt('New deck', 'Built from scratch'), opt('New or covered porch', 'Front, back or screened'), opt('Replace an old one', 'Tear out and rebuild'), opt('Repair', 'Boards, railings or stairs')] },
      { key: 'size', label: 'Size', q: 'Roughly how big?', opts: [opt('Small', 'Under 200 sq ft'), opt('Medium', '200–400 sq ft'), opt('Large', 'Over 400 sq ft'), opt('Not sure', "We'll measure together")] }
    ],
    'Bathroom or tile': [
      { key: 'scope', label: 'Work', q: 'What are we working on?', opts: [opt('Full bathroom remodel', 'Everything new'), opt('Shower or tub', 'Tile, surround or replacement'), opt('Tile floor or backsplash', 'Just the tile'), opt('Leak or water damage', 'Fix what went wrong')] },
      { key: 'room', label: 'Room', q: 'Which bathroom?', opts: [opt('Main bathroom'), opt("Hall or kids' bath"), opt('Basement bath'), opt('Half bath'), opt('More than one')] }
    ],
    'Kitchen': [
      { key: 'scope', label: 'Changes', multi: true, q: 'What would you like to change?', hint: 'Pick as many as you like.', opts: [opt('Cabinets'), opt('Countertops'), opt('Backsplash'), opt('Flooring'), opt('Full remodel')] },
      { key: 'layout', label: 'Layout', q: 'What about the layout?', opts: [opt('Keep it the same', 'Update what is there'), opt('Open it up', 'Move or remove walls'), opt('Not sure', "Let's talk it through")] }
    ],
    'Basement': [
      { key: 'scope', label: 'Today', q: 'Where is your basement today?', opts: [opt('Unfinished', 'Concrete and framing'), opt('Partly finished', 'Some rooms done'), opt('Finished, needs updating', 'Refresh or redo'), opt('Water damage', 'Repair first')] },
      { key: 'use', label: 'Use', multi: true, q: 'What will you use it for?', hint: 'Pick as many as you like.', opts: [opt('Family room'), opt('Bedroom'), opt('Bathroom'), opt('Office'), opt('Storage')] }
    ],
    'Addition or exterior': [
      { key: 'scope', label: 'Type', q: 'What kind of project?', opts: [opt('Room addition', 'More living space'), opt('Siding or trim', 'Replace or repair'), opt('Roofing', 'Replace or repair'), opt('Windows or doors', 'Replace or add'), opt('Garage or outbuilding', 'New or rebuild')] },
      { key: 'size', label: 'Scope', q: 'How much of the house?', opts: [opt('One area', 'A single spot'), opt('One side', 'One side of the house'), opt('Whole house', 'All the way around'), opt('Not sure', "We'll look together")] }
    ],
    'Repair': [
      { key: 'scope', label: 'Repair', multi: true, q: 'What needs fixing?', hint: 'Pick as many as you like.', opts: [opt('Rotted wood'), opt('Sagging floor'), opt('Deck or stairs'), opt('Water damage'), opt('Drywall'), opt('Doors or windows')] },
      { key: 'urgency', label: 'How soon', q: 'How soon does it need attention?', opts: [opt('Safety concern now', 'Please call me soon'), opt('In the next few weeks'), opt('It can wait', 'Planning ahead'), opt('Not sure')] }
    ],
  };
  const COMMON = [
    { key: 'when', label: 'Timing', q: 'When are you hoping to start?', opts: [opt('As soon as possible', 'Something needs attention'), opt('In the next 1–3 months', 'Ready to plan'), opt('In 3–6 months', 'Getting ahead of it'), opt('Just exploring', 'Gathering ideas')] },
    { key: 'care', label: 'Priorities', multi: true, q: 'What matters most to you?', hint: 'Pick as many as you like.', opts: [opt('A clear price with no surprises', 'A clear, written price'), opt('Minimal disruption to daily life', 'Keep life running'), opt('A clean jobsite', 'Respect for the house'), opt('Low-maintenance, long-lasting materials', 'Built to last'), opt('Regular updates', "Know what's happening"), opt('Help picturing the finished space', 'Ideas and examples')] }
  ];
  const short = { 'A clear price with no surprises': 'No Surprises', 'Minimal disruption to daily life': 'Less Disruption', 'A clean jobsite': 'Clean Jobsite', 'Low-maintenance, long-lasting materials': 'Built to Last', 'Regular updates': 'Updates', 'Help picturing the finished space': 'Help Me See It', 'As soon as possible': 'ASAP', 'In the next 1–3 months': '1–3 Months', 'In 3–6 months': '3–6 Months' };
  const expectFor = {
    'Deck or porch': 'We check footings, ledger and framing first. What holds it up matters more than the boards on top.',
    'Bathroom or tile': 'We look at what is behind the walls and floor before any new tile goes in.',
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

  const answers = {};
  let steps = [typeStep, finalStep];   // rebuilt once a project type is picked
  let stepI = 0;

  const makeStep = (def) => {
    const fs = document.createElement('fieldset');
    fs.className = 'q q-gen';
    fs.dataset.key = def.key;
    fs.dataset.label = def.label;
    if (!def.multi) fs.dataset.single = '';
    const opts = [...def.opts, OTHER];
    fs.innerHTML = `<legend>${def.q}</legend>${def.hint ? `<p class="q-hint">${def.hint}</p>` : ''}<div class="opts">${opts.map((o) =>
      `<button type="button" class="opt${o.v === 'Other' ? ' opt-other-text' : ''}" data-v="${o.v}"><strong>${short[o.v] || o.v}</strong>${o.sub ? `<span>${o.sub}</span>` : ''}</button>`).join('')}</div>`;
    wireOpts(fs);
    return fs;
  };
  const buildFlow = (type) => {
    form.querySelectorAll('.q-gen').forEach((q) => q.remove());
    Object.keys(answers).forEach((k) => { if (k !== 'type') delete answers[k]; });
    const generated = [...(FLOW[type] || []), ...COMMON].map(makeStep);
    generated.forEach((g) => finalStep.before(g));
    steps = [typeStep, ...generated, finalStep];
  };
  const pickedOther = () => Object.values(answers).some((v) => [].concat(v).includes('Other'));
  const summary = () => steps.filter((q) => answers[q.dataset.key] && answers[q.dataset.key].length)
    .map((q) => [q.dataset.label, [].concat(answers[q.dataset.key]).join('; ')]);
  const buildPlan = () => {
    const rows = summary();
    form.querySelector('.plan-list').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    const care = [].concat(answers.care || []);
    const items = [
      'A free visit: Gary comes out, listens, and looks closely at the space.',
      expectFor[answers.type],
      ...care.map((c) => careNote[c]),
      care.includes('A clear price with no surprises') ? null : 'A written quote you review together, at your pace.'
    ].filter(Boolean);
    form.querySelector('.plan-expect').innerHTML = items.map((t) => `<li>${t}</li>`).join('');
    form.elements.project_plan.value = rows.map(([k, v]) => `${k}: ${v}`).join(' | ');
    const other = pickedOther();
    finalLabel.textContent = other ? 'You picked "Other." Tell us a little more:' : 'Anything else we should know?';
    finalStep.classList.toggle('needs-note', other);
  };
  const contactOk = () => {
    const ok = form.elements.name.value.trim() && form.elements.phone.value.trim();
    formNote.textContent = ok ? '' : 'Please add your name and phone number so we can reach you.';
    return ok;
  };
  const renderStep = () => {
    steps.forEach((q, i) => q.classList.toggle('on', i === stepI));
    blade2.style.width = `${(stepI / Math.max(1, steps.length - 1)) * 100}%`;
    mLabel.textContent = answers.type ? `Step ${stepI + 1} of ${steps.length}` : `Step ${stepI + 1}`;
    pBack.disabled = stepI === 0;
    const cur = steps[stepI];
    const last = cur === finalStep;
    pNext.style.display = last ? 'none' : '';
    const key = cur.dataset.key;
    pNext.disabled = !last && !(answers[key] && answers[key].length);
    if (last) buildPlan();
  };
  const go = (d) => {
    stepI = clamp(stepI + d, 0, steps.length - 1);
    renderStep();
  };
  function wireOpts(q) {
    const single = q.hasAttribute('data-single');
    q.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => {
      const key = q.dataset.key;
      if (single) {
        q.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === o));
        const changed = answers[key] !== o.dataset.v;
        answers[key] = o.dataset.v;
        if (key === 'type' && (changed || steps.length === 2)) buildFlow(o.dataset.v);
        renderStep();
        setTimeout(() => { if (steps[stepI] === q) go(1); }, 320);
      } else {
        o.classList.toggle('sel');
        answers[key] = [...q.querySelectorAll('.opt.sel')].map((x) => x.dataset.v);
        renderStep();
      }
    }));
  }
  wireOpts(typeStep);
  pNext.addEventListener('click', () => go(1));
  pBack.addEventListener('click', () => go(-1));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Sends from "Just send my info" or the plan's last step. Enter in a field doesn't send early.
    const btn = e.submitter;
    if (!btn || !(btn.classList.contains('send-now') || btn.classList.contains('send-plan'))) return;
    if (!contactOk()) {
      contactBlock.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      form.elements[form.elements.name.value.trim() ? 'phone' : 'name'].focus({ preventScroll: true });
      return;
    }
    if (btn.classList.contains('send-now')) form.elements.project_plan.value = summary().map(([k, v]) => `${k}: ${v}`).join(' | ');
    const name = form.elements.name.value.trim();
    [...form.children].forEach((c) => { c.hidden = true; });
    const done = document.createElement('div');
    done.innerHTML = `<p class="planner-done"><strong>Thanks, ${name.split(' ')[0]}.</strong> Your request is on its way to Gary. He'll call you to set up a time to see the space.</p>`;
    form.appendChild(done);
  });
  renderStep();

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

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
