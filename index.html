function renderAllUnranked() {
  ensureIndices();
  const cards = Array.from(grid.querySelectorAll('.card'));

  // Bucket ALL cards by category order
  const buckets = new Map(ORDER_LOWER.map(k => [k, []]));
  const misc = [];
  cards.forEach(c => {
    const cat = norm(c.dataset.category);
    if (buckets.has(cat)) buckets.get(cat).push(c);
    else misc.push(c);
  });

  // Preserve original DOM order within each category using data-index
  const frag = document.createDocumentFragment();
  ORDER_LOWER.forEach(k => {
    buckets.get(k)
      .sort((a, b) => getIndex(a) - getIndex(b))
      .forEach(c => frag.appendChild(c));
  });
  misc
    .sort((a, b) => getIndex(a) - getIndex(b))
    .forEach(c => frag.appendChild(c));
  grid.appendChild(frag);

  // Show ALL cards
  cards.forEach(c => c.style.display = '');

  emptyNote.style.display = cards.length ? 'none' : 'block';
  toggleCategoryChips(true);
  setHorizontalLayout(2);
}
