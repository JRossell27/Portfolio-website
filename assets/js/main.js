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
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');
document.addEventListener('click', e => {
  const opener = e.target.closest('.open-modal');
  if (opener) {
    const id = opener.dataset.vimeo;
    modalPlayer.src = `https://player.vimeo.com/video/${id}`;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  if (e.target.hasAttribute('data-close') || e.target.classList.contains('modal-close')) {
    modalPlayer.src = '';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    modalPlayer.src = '';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
});
