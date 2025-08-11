// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Filters + full-bleed horizontal scroller + category sort + sticky fades
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
const hscroll = grid.parentElement; // .hscroll wrapper
const emptyNote = document.getElementById('emptyNote');

const ORDER = [
  'Social Media Videos',
  'Interviews',
  'Shot On iPhone',
  'MLB Network',
  'Weddings'
];
const ORDER_LOWER = ORDER.map(s => s.toLowerCase().trim());
const norm = s => (s || '').toLowerCase().trim();

function sortAllByCategory() {
  const cards = Array.from(grid.querySelectorAll('.card'));
  const buckets = new Map(ORDER_LOWER.map(k => [k, []]));
  const misc = [];
  cards.forEach(c => {
    const cat = norm(c.dataset.category);
    if (buckets.has(cat)) buckets.get(cat).push(c); else misc.push(c);
  });
  const frag = document.createDocumentFragment();
  ORDER_LOWER.forEach(k => buckets.get(k).forEach(c => frag.appendChild(c)));
  misc.forEach(c => frag.appendChild(c));
  grid.appendChild(frag);
}

function setHorizontalLayout(filter) {
  // Turn on horizontal for All and for every category on >=640px
  const vw = window.innerWidth;
  if (vw < 640) {
    grid.classList.remove('horizontal', 'one-row');
    grid.style.removeProperty('--col-width');
    updateScrollFades();
    return;
  }

  grid.classList.add('horizontal');
  grid.classList.toggle('one-row', filter !== 'all'); // All = 2 rows, others = 1 row

  // Match your vertical card width at breakpoints (2-up on tablet, 3-up on desktop)
  const styles = getComputedStyle(grid);
  const gap = parseInt(styles.gap, 10) || 16;
  const containerW = grid.getBoundingClientRect().width;
  const columns = (vw >= 960) ? 3 : 2;
  const colW = Math.floor((containerW - gap * (columns - 1)) / columns);
  grid.style.setProperty('--col-width', `${colW}px`);

  requestAnimationFrame(updateScrollFades);
}

function applyFilter(filter) {
  const cards = Array.from(grid.querySelectorAll('.card'));
  const isAll = filter === 'all';

  if (isAll) sortAllByCategory();

  let anyVisible = false;
  cards.forEach(card => {
    const show = isAll || norm(card.dataset.category) === norm(filter);
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });

  emptyNote.style.display = cards.length ? (anyVisible ? 'none' : 'block') : 'block';
  setHorizontalLayout(filter);
}

// Sticky fade logic (on wrapper; reads grid’s scroll)
function updateScrollFades() {
  const canScroll = grid.scrollWidth > grid.clientWidth + 1;
  const atStart = grid.scrollLeft <= 1;
  const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 1;
  hscroll.classList.toggle('show-left-fade',  canScroll && !atStart);
  hscroll.classList.toggle('show-right-fade', canScroll && !atEnd);
}

grid.addEventListener('scroll', () => updateScrollFades(), { passive: true });

btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.filter-btn.active');
  const current = activeBtn ? activeBtn.dataset.filter : 'all';
  setHorizontalLayout(current);
});

// Initial render
applyFilter('all');
requestAnimationFrame(updateScrollFades);

// ===== Modal open/close =====
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');

function openModal(id, ratio) {
  modalPlayer.src = `https://player.vimeo.com/video/${id}`;
  if (ratio) modal.dataset.ratio = ratio; else modal.removeAttribute('data-ratio');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalPlayer.src = '';
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const opener = e.target.closest('.open-modal');
  if (opener && opener.dataset.vimeo) {
    openModal(opener.dataset.vimeo, opener.dataset.ratio);
    return;
  }
  if (modal.getAttribute('aria-hidden') === 'false') {
    const clickedBackdrop = e.target.hasAttribute('data-close');
    const clickedCloseBtn = e.target.closest('.modal-close');
    const insideVideo = !!e.target.closest('.video-responsive');
    if (clickedBackdrop || clickedCloseBtn || !insideVideo) closeModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const el = document.activeElement;
    if (el && el.classList && el.classList.contains('open-modal') && el.dataset.vimeo) {
      openModal(el.dataset.vimeo, el.dataset.ratio);
    }
  }
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});
