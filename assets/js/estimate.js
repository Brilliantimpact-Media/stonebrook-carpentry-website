// StoneBrook Carpentry — estimate form with the built-in Project Planner.
// Shared by the homepage (#estimate) and the standalone /free-estimate/ page.
(() => {
  const form = document.querySelector('.planner');
  if (!form) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // ---- Estimate form: contact first, then the Project Planner ----
  // Step 1 is name/phone/email/town (they can send right there). Then the project type,
  // follow-up questions tailored to it, timing, priorities, and a final summary + notes.
  // Contact info sits above the planner. The project-type step has a "Just send my info" tile; every follow-up question has an "Other" option; picking it asks for details on the last step.
  // No backend yet: connect to the client's form service before launch.
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
  // Field checks: name, a 10-digit phone, and a valid email if one is given.
  const checks = {
    name: (v) => (v.trim() ? '' : 'Please enter your name.'),
    phone: (v) => {
      if (!v.trim()) return 'Please enter a phone number so we can reach you.';
      return v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a 10-digit phone number.';
    },
    email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.'),
  };
  const showErr = (field, msg) => {
    const input = form.elements[field];
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    form.querySelector(`#err-${field}`).textContent = msg;
  };
  const contactOk = () => {
    let first = null;
    Object.entries(checks).forEach(([field, check]) => {
      const msg = check(form.elements[field].value);
      showErr(field, msg);
      if (msg && !first) first = field;
    });
    formNote.textContent = first ? 'Please fix the highlighted field above.' : '';
    return first;
  };
  // Clear a field's error as soon as it's corrected.
  Object.keys(checks).forEach((field) => form.elements[field].addEventListener('input', () => {
    if (form.elements[field].getAttribute('aria-invalid') === 'true' && !checks[field](form.elements[field].value)) {
      showErr(field, '');
      if (!form.querySelector('[aria-invalid="true"]')) formNote.textContent = '';
    }
  }));
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
    const bad = contactOk();
    if (bad) {
      contactBlock.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      form.elements[bad].focus({ preventScroll: true });
      return;
    }
    if (btn.classList.contains('send-now')) form.elements.project_plan.value = summary().map(([k, v]) => `${k}: ${v}`).join(' | ');
    const first = form.elements.name.value.trim().split(' ')[0];
    const finish = () => {
      try { sessionStorage.setItem('sbName', first); } catch (err) { /* storage blocked */ }
      location.href = form.dataset.thanks;
    };
    // The form service address is set in tools/build.py (FORM_ENDPOINT). Until then the
    // site is in preview mode: nothing is sent, the visitor just sees the thank-you page.
    const endpoint = (document.querySelector('meta[name="sb-form-endpoint"]') || {}).content;
    if (!endpoint) { finish(); return; }
    btn.disabled = true;
    formNote.textContent = 'Sending…';
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(r.status); finish(); })
      .catch(() => {
        btn.disabled = false;
        formNote.textContent = "Sorry, your request didn't go through. Please try again, or call (715) 308-2180.";
      });
  });
  renderStep();
})();
