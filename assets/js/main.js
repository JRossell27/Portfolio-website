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
const dialog = modal.querySelector('.modal-dialog');
const modalPlayer = document.getElementById('modalPlayer');

function openModal(id) {
  modalPlayer.src = `https://player.vimeo.com/video/${id}`;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalPlayer.src = ''; // stop playback
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open on any element with .open-modal
document.addEventListener('click', e => {
  const opener = e.target.closest('.open-modal');
  if (opener && opener.dataset.vimeo) {
    openModal(opener.dataset.vimeo);
    return;
  }

  // Close if:
  // - click on [data-close] backdrop
  // - click on the X button
  // - click anywhere that is not inside the modal dialog
  if (modal.getAttribute('aria-hidden') === 'false') {
    const clickedBackdrop = e.target.hasAttribute('data-close');
    const clickedCloseBtn = e.target.classList.contains('modal-close');
    const clickedOutsideDialog = !e.target.closest('.modal-dialog');
    if (clickedBackdrop || clickedCloseBtn || clickedOutsideDialog) {
      closeModal();
    }
  }
});

// Close on Esc
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

