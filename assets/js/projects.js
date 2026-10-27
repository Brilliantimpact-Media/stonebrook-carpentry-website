// StoneBrook Carpentry — project gallery pages (/projects/ and each category page):
// keeps the current category tab in view on phones, sends old #category links to the
// category's own page, and opens photos in a lightbox with previous/next.
(() => {
  // Old links like projects/#decks-porches now have their own page.
  const cats = [...document.querySelectorAll('.ptab[data-cat]')].map((t) => t.dataset.cat);
  const legacy = location.hash.slice(1);
  if (legacy && cats.includes(legacy) && document.body.dataset.cat === 'all') {
    location.replace(document.querySelector(`.ptab[data-cat="${legacy}"]`).href);
    return;
  }

  // Category tabs scroll sideways on phones: keep the current one centered.
  const tabRow = document.querySelector('.ptabs');
  const current = tabRow && tabRow.querySelector('[aria-current="page"]');
  if (current) tabRow.scrollLeft = current.offsetLeft - (tabRow.clientWidth - current.offsetWidth) / 2;

  // Switching categories feels like one page: if the tabs were stuck under the header when a
  // tab was clicked, open the next page at that same spot instead of back at the top.
  const bar = document.querySelector('.ptabs-bar');
  const header = document.querySelector('.site-header');
  const barTop = () => bar.getBoundingClientRect().top + scrollY - header.offsetHeight;
  let came = null;
  try { came = sessionStorage.getItem('sbTab'); sessionStorage.removeItem('sbTab'); } catch (e) { /* storage blocked */ }
  if (came === 'stuck' && !location.hash) {
    history.scrollRestoration = 'manual';
    scrollTo({ top: barTop(), behavior: 'instant' });
  }
  tabRow.querySelectorAll('.ptab').forEach((t) => t.addEventListener('click', () => {
    try { sessionStorage.setItem('sbTab', scrollY >= barTop() - 2 ? 'stuck' : 'top'); } catch (e) { /* storage blocked */ }
  }));

  // Lightbox (previous / next through every photo on the page)
  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('.lightbox-caption');
  const shots = [...document.querySelectorAll('.pshot')];
  let index = 0;
  const show = (i) => {
    index = (i + shots.length) % shots.length;
    const img = shots[index].querySelector('img');
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = shots[index].querySelector('figcaption').textContent;
  };
  shots.forEach((f, i) => f.querySelector('.pshot-btn').addEventListener('click', () => { show(i); box.showModal(); }));
  box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
