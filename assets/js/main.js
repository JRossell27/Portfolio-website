// ========= Year =========
document.getElementById('year').textContent = new Date().getFullYear();

// ========= Filters + full-bleed horizontal scroller + Best/All logic + sticky fades =========
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
const hscroll = grid.parentElement; // .hscroll wrapper
const emptyNote = document.getElementById('emptyNote');

// Category order for grouping
const ORDER = [
  'Social Media Videos',
  'Interviews/Long-Form',
  'Shot On iPhone',
  'MLB Network',
  'Weddings'
];
const ORDER_LOWER = ORDER.map(s => s.toLowerCase().trim());
const norm = s => (s || '').toLowerCase().trim();

// Show a peek of the next card in the scroller
const PEEK = 0.5;

// ----- indices to preserve original HTML order when needed -----
let indicesInit = false;
function ensureIndices() {
  if (indicesInit) return;
  Array.from(grid.querySelectorAll('.card')).forEach((c, i) => {
    if (!c.dataset.index) c.dataset.index = String(i);
  });
  indicesInit = true;
}
const hasRank = el => Number.isFinite(parseFloat(el.dataset.rank));
const getRank = el => parseFloat(el.dataset.rank);
const getIndex = el => parseInt(el.dataset.index || '0', 10);

// ----- chips shown only in "All" -----
function toggleCategoryChips(show) {
  const cards = Array.from(grid.querySelectorAll('.card'));
  cards.forEach(card => {
    const body = card.querySelector('.card-body');
    if (!body) return;
    let chip = body.querySelector('.cat-chip');
    if (show) {
      if (!chip) {
        chip = document.createElement('span');
        chip.className = 'cat-chip';
        body.insertBefore(chip, body.firstChild);
      }
      chip.textContent = card.dataset.category || '';
    } else if (chip) {
      chip.remove();
    }
  });
}

// ----- layout: full-bleed horizontal, rows=2 for Best and All, rows=1 for categories -----
function setHorizontalLayout(rowsWanted) {
  const vw = window.innerWidth;

  // Small screens: vertical list
  if (vw < 640 || rowsWanted === 0) {
    grid.classList.remove('horizontal', 'one-row');
    grid.style.removeProperty('--col-width');
    updateScrollFades();
    return;
  }

  grid.classList.add('horizontal');
  grid.classList.toggle('one-row', rowsWanted === 1);

  // desktop=3 columns, tablet=2 columns
  const columnsFull = (vw >= 960) ? 3 : 2;

  // Compute card width so we show N full cards + a PEEK of the next
  const styles = getComputedStyle(grid);
  const gap = parseInt(styles.gap, 10) || 16;
  const containerW = grid.getBoundingClientRect().width;

  // containerW = (N + PEEK) * colW + (N - 1) * gap  => colW
  const colW = Math.floor((containerW - (columnsFull - 1) * gap) / (columnsFull + PEEK));
  grid.style.setProperty('--col-width', `${colW}px`);

  requestAnimationFrame(updateScrollFades);
}

// ----- renderers -----
function renderBest() {
  ensureIndices();
  const cards = Array.from(grid.querySelectorAll('.card'));
  const ranked = cards.filter(hasRank)
    .sort((a, b) => getRank(a) - getRank(b) || getIndex(a) - getIndex(b));

  // reorder DOM to match ranked order
  const frag = document.createDocumentFragment();
  ranked.forEach(c => frag.appendChild(c));
  grid.appendChild(frag);

  // show ranked only
  cards.forEach(c => c.style.display = hasRank(c) ? '' : 'none');

  emptyNote.style.display = ranked.length ? 'none' : 'block';
  toggleCategoryChips(false);
  setHorizontalLayout(2);
}

function renderAllUnranked() {
  ensureIndices();
  const cards = Array.from(grid.querySelectorAll('.card'));
  const unranked = cards.filter(c => !hasRank(c));

  // bucket unranked by category order
  const buckets = new Map(ORDER_LOWER.map(k => [k, []]));
  const misc = [];
  unranked.forEach(c => {
    const cat = norm(c.dataset.category);
    if (buckets.has(cat)) buckets.get(cat).push(c);
    else misc.push(c);
  });

  // preserve original order inside each bucket using data-index
  const frag = document.createDocumentFragment();
  ORDER_LOWER.forEach(k => {
    buckets.get(k).sort((a, b) => getIndex(a) - getIndex(b)).forEach(c => frag.appendChild(c));
  });
  misc.sort((a, b) => getIndex(a) - getIndex(b)).forEach(c => frag.appendChild(c));
  grid.appendChild(frag);

  // show unranked only
  cards.forEach(c => c.style.display = hasRank(c) ? 'none' : '');

  emptyNote.style.display = unranked.length ? 'none' : 'block';
  toggleCategoryChips(true);
  setHorizontalLayout(2);
}

function renderCategory(catLabel) {
  ensureIndices();
  const cards = Array.from(grid.querySelectorAll('.card'));
  const target = cards.filter(c => norm(c.dataset.category) === norm(catLabel));

  // inside the category: ranked first by rank, then unranked by original index
  const ranked = target.filter(hasRank)
    .sort((a, b) => getRank(a) - getRank(b) || getIndex(a) - getIndex(b));
  const unranked = target.filter(c => !hasRank(c))
    .sort((a, b) => getIndex(a) - getIndex(b));

  const frag = document.createDocumentFragment();
  ranked.concat(unranked).forEach(c => frag.appendChild(c));
  grid.appendChild(frag);

  // show only this category
  cards.forEach(c => {
    const show = norm(c.dataset.category) === norm(catLabel);
    c.style.display = show ? '' : 'none';
  });

  emptyNote.style.display = target.length ? 'none' : 'block';
  toggleCategoryChips(false);
  setHorizontalLayout(1);
}

// ----- filter controller -----
function applyFilter(filter) {
  if (filter === 'best') return renderBest();
  if (filter === 'all') return renderAllUnranked();
  return renderCategory(filter);
}

// ----- sticky fades on wrapper; read grid scroll -----
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
  const current = activeBtn ? activeBtn.dataset.filter : 'best';
  // rows depend on filter, but setHorizontalLayout recalculates widths
  if (current === 'best' || current === 'all') setHorizontalLayout(2);
  else setHorizontalLayout(1);
});

// Initial render to Best Work
applyFilter('best');
requestAnimationFrame(updateScrollFades);

// ========= Modal open/close =========
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
