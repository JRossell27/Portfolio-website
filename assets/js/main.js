// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Filters
const btns = document.querySelectorAll('.filter-btn');
const grid = document.getElementById('projectGrid');
const emptyNote = document.getElementById('emptyNote');
function applyFilter(filter) {
  const cards = grid.querySelectorAll('.card');
  let anyVisible = false;
  cards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });
  emptyNote.style.display = cards.length ? (anyVisible ? 'none' : 'block') : 'block';
}
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});
applyFilter('all');

// Modal video player
// ===== Modal open and close helpers =====
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');

function openModal(id) {
  modalPlayer.src = `https://player.vimeo.com/video/${id}`;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalPlayer.src = ''; // stops playback
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open from any element with .open-modal
// Open and close already defined above: openModal(id), closeModal()

document.addEventListener('click', e => {
  // Open from any .open-modal
  const opener = e.target.closest('.open-modal');
  if (opener && opener.dataset.vimeo) {
    openModal(opener.dataset.vimeo);
    return;
  }

  // When modal is open, close on:
  //  - backdrop click
  //  - X button click
  //  - any click not inside the .video-responsive area
  if (modal.getAttribute('aria-hidden') === 'false') {
    const clickedBackdrop = e.target.hasAttribute('data-close');
    const clickedCloseBtn = e.target.closest('.modal-close');
    const insideVideo = !!e.target.closest('.video-responsive');
    if (clickedBackdrop || clickedCloseBtn || !insideVideo) {
      closeModal();
    }
  }
});

// Esc still closes
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});



