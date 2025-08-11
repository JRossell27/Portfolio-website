// ===== Year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Filters with 2-row horizontal scroller for "All" =====
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
const emptyNote = document.getElementById('emptyNote');

function applyFilter(filter) {
  const cards = grid.querySelectorAll('.card');
  const isAll = filter === 'all';

  // Turn on 2-row horizontal scroller only for "All"
  grid.classList.toggle('horizontal', isAll);

  let anyVisible = false;
  cards.forEach(card => {
    const show = isAll || card.dataset.category === filter;
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });

  emptyNote.style.display = cards.length ? (anyVisible ? 'none' : 'block') : 'block';
}

// Filter button clicks
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
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
