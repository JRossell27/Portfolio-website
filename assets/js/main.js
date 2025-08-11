// ===== Year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Filters with 2-row horizontal scroller for "All" + category sort + edge fades =====
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
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
  // bucket by normalized category
  const buckets = new Map(ORDER_LOWER.map(k => [k, []]));
  const misc = [];
  cards.forEach(c => {
    const cat = norm(c.dataset.category);
    if (buckets.has(cat)) buckets.get(cat).push(c);
    else misc.push(c);
  });
  // re-append in desired order, keeping original order inside each bucket
  const frag = document.createDocumentFragment();
  ORDER_LOWER.forEach(k => buckets.get(k).forEach(c => frag.appendChild(c)));
  misc.forEach(c => frag.appendChild(c)); // anything unknown goes last
  grid.appendChild(frag);
}

function updateHorizontalSizing(isAll) {
  if (!isAll) {
    grid.classList.remove('horizontal');
    grid.style.removeProperty('--col-width');
    updateScrollFades(); // hide fades
    return;
  }
  // turn on sideways 2-row scroller
  grid.classList.add('horizontal');

  // Match your vertical layout widths at each breakpoint
  const vw = window.innerWidth;
  const styles = getComputedStyle(grid);
  const gap = parseInt(styles.gap, 10) || 16;

  let columns;
  if (vw >= 960) columns = 3;       // desktop equals your 3-up layout
  else if (vw >= 640) columns = 2;  // tablet equals your 2-up layout
  else {
    // small screens: fall back to normal vertical
    grid.classList.remove('horizontal');
    grid.style.removeProperty('--col-width');
    updateScrollFades();
    return;
  }

  const container = grid.getBoundingClientRect().width;
  const colWidth = Math.floor((container - gap * (columns - 1)) / columns);
  grid.style.setProperty('--col-width', `${colWidth}px`);

  // refresh fades now that sizes may have changed
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

  updateHorizontalSizing(isAll);
}

// Filter button clicks
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// Recompute when resizing
window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.filter-btn.active');
  const current = activeBtn ? activeBtn.dataset.filter : 'all';
  updateHorizontalSizing(current === 'all');
});

// ===== Edge fade helpers for the horizontal scroller =====
function updateScrollFades() {
  // show fades only when content overflows horizontally
  const canScroll = grid.scrollWidth > grid.clientWidth + 1;
  const atStart = grid.scrollLeft <= 1;
  const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 1;

  grid.classList.toggle('show-left-fade', canScroll && !atStart);
  grid.classList.toggle('show-right-fade', canScroll && !atEnd);
}

grid.addEventListener('scroll', () => {
  // passive scroll handler for smooth updates
  updateScrollFades();
}, { passive: true });

// Initial render
applyFilter('all');
requestAnimationFrame(updateScrollFades);

// ===== Modal open and close =====
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');

function openModal(id, ratio) {
  modalPlayer.src = `https://player.vimeo.com/video/${id}`;
  if (ratio) modal.dataset.ratio = ratio; else modal.removeAttribute('data-ratio');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalPlayer.src = ''; // stop playback
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open on click from any element with .open-modal
document.addEventListener('click', e => {
  const opener = e.target.closest('.open-modal');
  if (opener && opener.dataset.vimeo) {
    openModal(opener.dataset.vimeo, opener.dataset.ratio);
    return;
  }

  // If modal is open, close when:
  // - clicking the backdrop or X
  // - clicking anywhere not inside the .video-responsive area
  if (modal.getAttribute('aria-hidden') === 'false') {
    const clickedBackdrop = e.target.hasAttribute('data-close');
    const clickedCloseBtn = e.target.closest('.modal-close');
    const insideVideo = !!e.target.closest('.video-responsive');
    if (clickedBackdrop || clickedCloseBtn || !insideVideo) {
      closeModal();
    }
  }
});

// Open on Enter when focused on a .open-modal card
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const el = document.activeElement;
    if (el && el.classList && el.classList.contains('open-modal') && el.dataset.vimeo) {
      openModal(el.dataset.vimeo, el.dataset.ratio);
    }
  }
});

// Close on Esc
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});
