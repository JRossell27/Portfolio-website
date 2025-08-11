// ========= Year =========
document.getElementById('year').textContent = new Date().getFullYear();

// ========= Filters + full-bleed horizontal scroller + category sort + sticky fades =========
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
const hscroll = grid.parentElement; // .hscroll wrapper
const emptyNote = document.getElementById('emptyNote');

// Desired category order for "All"
const ORDER = [
  'Social Media Videos',
  'Interviews/Long-Form',
  'Shot On iPhone',
  'MLB Network',
  'Weddings'
];
const ORDER_LOWER = ORDER.map(s => s.toLowerCase().trim());
const norm = s => (s || '').toLowerCase().trim();

// How much of the next card to show (0.5 = half)
const PEEK = 0.5;

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

// Inject/remove category chips in card bodies
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

function setHorizontalLayout(filter) {
  const vw = window.innerWidth;

  // Small screens: vertical list
  if (vw < 640) {
    grid.classList.remove('horizontal', 'one-row');
    grid.style.removeProperty('--col-width');
    updateScrollFades();
    return;
  }

  // Horizontal on >=640px. All = 2 rows, others = 1 row
  grid.classList.add('horizontal');
  grid.classList.toggle('one-row', filter !== 'all');

  // Match your vertical layout: desktop=3 columns, tablet=2 columns
  const columnsFull = (vw >= 960) ? 3 : 2;

  // Compute card width so we show N full cards + a PEEK of the next
  const styles = getComputedStyle(grid);
  const gap = parseInt(styles.gap, 10) || 16;
  const containerW = grid.getBoundingClientRect().width;

  // containerW = (N + PEEK) * colW + (N - 1) * gap  => colW
  const colW = Math.floor(
    (containerW - (columnsFull - 1) * gap) / (columnsFull + PEEK)
  );
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
  toggleCategoryChips(isAll); // <— show chips only in All
}

// Sticky fades on the wrapper; read the grid’s scroll state
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
