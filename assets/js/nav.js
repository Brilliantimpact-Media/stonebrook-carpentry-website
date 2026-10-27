// StoneBrook Carpentry — "Our Work" dropdown in the main navigation (every page).
// Desktop: opens on hover, with a short delay before closing so the cursor can travel
// from "Our Work" into the menu. Keyboard/touch: the arrow button toggles it, arrow keys
// move through the links and Escape closes it. Without JS, CSS hover/focus still opens it.
(() => {
  document.documentElement.classList.add('nav-js');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');

  document.querySelectorAll('.has-menu').forEach((item) => {
    const btn = item.querySelector('.sub-toggle');
    const links = [...item.querySelectorAll('.submenu a')];
    let closeTimer;
    const set = (open) => {
      clearTimeout(closeTimer);
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };

    btn.addEventListener('click', () => set(!item.classList.contains('open')));
    item.addEventListener('mouseenter', () => { if (canHover.matches) set(true); });
    item.addEventListener('mouseleave', () => {
      if (!canHover.matches) return;
      closeTimer = setTimeout(() => set(false), 250);
    });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    item.addEventListener('keydown', (e) => {
      const i = links.indexOf(document.activeElement);
      if (e.key === 'Escape' && item.classList.contains('open')) {
        set(false);
        btn.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        set(true);
        links[Math.min(links.length - 1, i + 1)].focus();
      } else if (e.key === 'ArrowUp' && i >= 0) {
        e.preventDefault();
        (i === 0 ? btn : links[i - 1]).focus();
      }
    });
    document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
  });
})();
