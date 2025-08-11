// ===== Year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Filters with 2-row horizontal scroller for "All" =====
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
const PRI = Object.fromEntries(ORDER.map((name, i) => [name, i]));

function sortAllByCategory() {
  const cards = Array.from(grid.querySelectorAll('.card'));
  cards.sort((a, b) => {
    const pa = PRI[a.dataset.category] ?? 999;
    const pb = PRI[b.dataset.category] ?? 999;
    return pa - pb;
  });
  // Re-append in new order (stable relative order within each category)
  cards.forEach(c => grid.appendChild(c));
}

function updateHorizontalSizing(isAll) {
  if (!isAll) {
    grid.classList.remove('horizontal');
    grid.style.removeProperty('--col-width');
    return;
  }
  // Turn on horizontal mode
  grid.classList.add('horizontal');

  // Match your existing vertical sizes:
  // >=960px: 3 columns, >=640px: 2 columns, else: 1 column (falls back to vertical)
  const vw = window.innerWidth;
  const styles = getComputedStyle(grid);
  const gap = parseInt(styles.gap, 10) || 16;

  let columns;
  if (vw >= 960) columns = 3;
  else if (vw >= 640) columns = 2;
  else columns = 1;

  if (columns === 1) {
    // Small screens: keep normal vertical flow
    grid.classList.remove('horizontal');
    grid.style.removeProperty('--col-width');
    return;
  }

  // Compute column width to match the vertical grid at this breakpoint
  const container = grid.getBoundingClientRect().width;
  const colWidth = Math.floor((container - gap * (columns - 1)) / columns);
  grid.style.setProperty('--col-width', `${colWidth}px`);
}

function applyFilter(filter) {
  const cards = Array.from(grid.querySelectorAll('.card'));
  const isAll = filter === 'all';

  if (isAll) sortAllByCategory();

  let anyVisible = false;
  cards.forEach(card => {
    const show = isAll || card.dataset.category === filter;
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

// Recompute sizes on resize
window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.filter-btn.active');
  const current = activeBtn ? activeBtn.dataset.filter : 'all';
  updateHorizontalSizing(current === 'all');
});

// Initial render
applyFilter('all');

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
