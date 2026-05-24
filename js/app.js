(function () {
  'use strict';

  const TYPE_COLORS = {
    dispensary:  '#4ade80',
    processor:   '#fb923c',
    distributor: '#60a5fa',
  };

  // ── Map init ──────────────────────────────────────────────
  const map = L.map('map', {
    center: [40.3, -82.6],
    zoom: 7,
    zoomControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // ── Marker icon factory ───────────────────────────────────
  function makeIcon(type, highlight) {
    const color = TYPE_COLORS[type] || '#94a3b8';
    const size  = highlight ? 16 : 12;
    const ring  = highlight ? `box-shadow:0 0 0 3px ${color},0 2px 8px rgba(0,0,0,0.5);` : 'box-shadow:0 1px 4px rgba(0,0,0,0.5);';
    return L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #161b22;border-radius:50%;${ring}transition:all .15s;"></div>`,
      iconSize:   [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)],
    });
  }

  // ── Popup builder ─────────────────────────────────────────
  function buildPopup(b) {
    const phone = b.phone ? `
      <div class="popup-detail">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
        <span>${b.phone}</span>
      </div>` : '';

    const website = b.website ? `
      <a class="popup-link" href="https://${b.website}" target="_blank" rel="noopener">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"/></svg>
        ${b.website}
      </a>` : '';

    return `
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-dot ${b.type}"></span>
          <div>
            <div class="popup-name">${b.name}</div>
            <div class="popup-type ${b.type}">${b.type}</div>
          </div>
        </div>
        <div class="popup-detail">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          <span>${b.address}, ${b.city}, OH ${b.zip}</span>
        </div>
        ${phone}
        ${website}
      </div>
    `;
  }

  // ── State ─────────────────────────────────────────────────
  let activeFilter = 'all';
  let searchQuery  = '';
  let activeCardId = null;
  const markerMap  = {};

  // ── Cluster group ─────────────────────────────────────────
  const clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 45,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  });
  map.addLayer(clusterGroup);

  // ── Build markers ─────────────────────────────────────────
  BUSINESSES.forEach(b => {
    const marker = L.marker([b.lat, b.lng], { icon: makeIcon(b.type, false) });
    marker.bindPopup(buildPopup(b), { maxWidth: 280, minWidth: 220 });

    marker.on('click', () => {
      highlightCard(b.id);
    });

    markerMap[b.id] = marker;
    clusterGroup.addLayer(marker);
  });

  // ── Sidebar refs ─────────────────────────────────────────
  const searchInput  = document.getElementById('search-input');
  const clearBtn     = document.getElementById('clear-btn');
  const resultsList  = document.getElementById('results-list');
  const resultsCount = document.getElementById('results-count');
  const filterBtns   = document.querySelectorAll('.filter-btn');

  // ── Count badges ─────────────────────────────────────────
  function updateBadges() {
    const counts = { all: BUSINESSES.length, dispensary: 0, processor: 0, distributor: 0 };
    BUSINESSES.forEach(b => counts[b.type]++);
    document.getElementById('badge-all').textContent         = counts.all;
    document.getElementById('badge-dispensary').textContent  = counts.dispensary;
    document.getElementById('badge-processor').textContent   = counts.processor;
    document.getElementById('badge-distributor').textContent = counts.distributor;
  }

  // ── Filter + search logic ─────────────────────────────────
  function getFiltered() {
    const q = searchQuery.toLowerCase();
    return BUSINESSES.filter(b => {
      const matchType   = activeFilter === 'all' || b.type === activeFilter;
      const matchSearch = !q || b.name.toLowerCase().includes(q)
                               || b.city.toLowerCase().includes(q)
                               || b.zip.includes(q)
                               || b.address.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }

  // ── Render sidebar list ───────────────────────────────────
  function renderList() {
    const filtered = getFiltered();
    resultsCount.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

    clusterGroup.clearLayers();
    filtered.forEach(b => clusterGroup.addLayer(markerMap[b.id]));

    if (!filtered.length) {
      resultsList.innerHTML = `
        <div class="no-results">
          <p>&#128269;</p>
          <p>No results found</p>
        </div>`;
      return;
    }

    resultsList.innerHTML = filtered.map(b => `
      <div class="result-card" data-id="${b.id}" data-type="${b.type}">
        <span class="card-dot ${b.type}"></span>
        <div class="card-body">
          <div class="card-name">${b.name}</div>
          <div class="card-meta">${b.city} &bull; ${b.zip}</div>
        </div>
        <span class="card-type ${b.type}">${b.type}</span>
      </div>
    `).join('');

    resultsList.querySelectorAll('.result-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id, 10);
        const b  = BUSINESSES.find(x => x.id === id);
        if (!b) return;

        map.flyTo([b.lat, b.lng], 14, { duration: 0.8 });
        setTimeout(() => {
          const marker = markerMap[id];
          if (marker) {
            clusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
          }
        }, 850);

        highlightCard(id);
      });
    });

    if (activeCardId) applyCardHighlight(activeCardId);
  }

  // ── Card highlight sync ───────────────────────────────────
  function highlightCard(id) {
    activeCardId = id;
    applyCardHighlight(id);

    Object.entries(markerMap).forEach(([mid, marker]) => {
      const b = BUSINESSES.find(x => x.id === parseInt(mid, 10));
      if (b) marker.setIcon(makeIcon(b.type, parseInt(mid, 10) === id));
    });
  }

  function applyCardHighlight(id) {
    resultsList.querySelectorAll('.result-card').forEach(card => {
      card.classList.toggle('active', parseInt(card.dataset.id, 10) === id);
    });

    const active = resultsList.querySelector('.result-card.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ── Filter buttons ────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.type;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      activeCardId = null;
      renderList();
    });
  });

  // ── Search ────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    activeCardId = null;
    renderList();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
    activeCardId = null;
    renderList();
  });

  // ── Mobile sidebar toggle ─────────────────────────────────
  const sidebar      = document.getElementById('sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');

  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  map.on('click', () => {
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });

  // ── Init ──────────────────────────────────────────────────
  updateBadges();
  renderList();
}());
