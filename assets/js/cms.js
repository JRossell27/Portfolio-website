// assets/js/cms.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 1) Fill these with your real values
const SUPABASE_URL = 'https://nnirdmhmqznpxkdubypc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaXJkbWhtcXpucHhrZHVieXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDc5NDcsImV4cCI6MjA3MDU4Mzk0N30.nLxI7N0a7uO8lyZSmWHaiS2t1SLFoyCLaM5ET0Lmon0';

// 2) Init
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3) Helpers from your page
const grid = document.getElementById('projectGrid');

function currentFilter() {
  const btn = document.querySelector('.filter-btn.active');
  return btn ? btn.dataset.filter : 'best';
}

// Creates a card element matching your existing structure
function createCard(row) {
  const article = document.createElement('article');
  article.className = 'card open-modal';
  article.dataset.category = row.category;
  article.dataset.vimeo = row.vimeo_id;
  if (row.rank !== null && row.rank !== undefined && row.rank !== '') {
    article.dataset.rank = row.rank;
  }
  article.dataset.source = 'supabase';

  article.innerHTML = `
    <img src="${row.thumbnail_url}" alt="${row.title}" loading="lazy">
    <div class="card-body">
      <h3 class="card-title">${row.title}</h3>
      <p class="card-meta">Added via CMS</p>
    </div>
  `;
  return article;
}

async function loadAndRenderVideos() {
  try {
    // Remove previously injected Supabase cards to avoid duplicates
    grid.querySelectorAll('.card[data-source="supabase"]').forEach(n => n.remove());

    const { data, error } = await supabase
      .from('videos')
      .select('id,title,vimeo_id,thumbnail_url,category,rank,is_visible,created_at')
      .eq('is_visible', true)
      .order('category', { ascending: true })
      .order('rank', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase load error:', error);
      return;
    }

    // Append rows as cards after your existing hardcoded cards
    const frag = document.createDocumentFragment();
    data.forEach(row => {
      const el = createCard(row);
      frag.appendChild(el);
    });
    grid.appendChild(frag);

    // Re-apply whatever tab is currently active so your sorting/grouping logic runs
    if (window.applyFilter) {
      window.applyFilter(currentFilter());
    }
  } catch (e) {
    console.error(e);
  }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadAndRenderVideos);