// search-engine.js - Buscador Universal con Dropdown Flotante para Datitos de la Jose
// Indexa PLACES_DATA y REELS_DATA, muestra resultados en vivo con autocomplete,
// soporta ?q= en URL para búsqueda cross-page.

(function() {
  'use strict';

  const QUICK_TAGS = [
    { label: 'Cabañas', query: 'cabañas' },
    { label: 'Tinajas', query: 'tinaja' },
    { label: 'Küchens', query: 'kuchen' },
    { label: 'Restaurantes', query: 'restaurante' },
    { label: 'Cafés', query: 'café' },
    { label: 'Miradores', query: 'mirador' },
    { label: 'Frutillar', query: 'frutillar' },
    { label: 'Piscina', query: 'piscina' }
  ];

  let dropdown = null;
  let searchInput = null;
  let debounceTimer = null;

  function init() {
    // Find all search inputs across pages
    searchInput = document.querySelector('#search-input') || document.querySelector('.search-input-box');
    if (!searchInput) return;

    // Ensure the input has an id for reference
    if (!searchInput.id) searchInput.id = 'search-input';

    // Remove any existing onkeypress handler (empresa.html had one)
    searchInput.removeAttribute('onkeypress');

    createDropdown();
    bindEvents();
    handleUrlQuery();
  }

  function createDropdown() {
    dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.id = 'search-dropdown';
    dropdown.innerHTML = '';
    
    // Position relative to the search bar wrapper
    const wrapper = searchInput.closest('.search-bar-wrapper');
    if (wrapper) {
      wrapper.style.position = 'relative';
      wrapper.appendChild(dropdown);
    } else {
      searchInput.parentElement.style.position = 'relative';
      searchInput.parentElement.appendChild(dropdown);
    }
  }

  function bindEvents() {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          showResults(query);
        } else if (query.length === 0) {
          showQuickTags();
        } else {
          hideDropdown();
        }
      }, 200);
    });

    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        showResults(query);
      } else {
        showQuickTags();
      }
    });

    // Enter key → navigate to index with ?q=
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) {
          // If we're already on index.html, just filter in-place
          if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            if (typeof window.resetFilters === 'function') {
              // Set search and trigger filter
              const appSearchInput = document.getElementById('search-input');
              if (appSearchInput) {
                appSearchInput.value = q;
                appSearchInput.dispatchEvent(new Event('input'));
              }
            }
            hideDropdown();
            const scrollTarget = document.getElementById('main-content-layout');
            if (scrollTarget) {
              scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            window.location.href = 'index.html?q=' + encodeURIComponent(q);
          }
        }
      }
      if (e.key === 'Escape') {
        hideDropdown();
        searchInput.blur();
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-bar-wrapper') && !e.target.closest('.search-dropdown')) {
        hideDropdown();
      }
    });
  }

  function buildIndex() {
    const results = [];

    // Index PLACES_DATA
    if (typeof PLACES_DATA !== 'undefined' && Array.isArray(PLACES_DATA)) {
      PLACES_DATA.forEach(place => {
        results.push({
          type: 'place',
          id: place.id,
          name: place.name,
          desc: place.shortDesc || place.personalTip || '',
          category: place.categoryBadge || place.category || '',
          image: place.image || '',
          rating: place.rating || null,
          searchText: [
            place.name, place.shortDesc, place.personalTip, place.address,
            place.category, place.categoryBadge, ...(place.tags || [])
          ].join(' ').toLowerCase()
        });
      });
    }

    // Index REELS_DATA
    if (typeof REELS_DATA !== 'undefined' && Array.isArray(REELS_DATA)) {
      REELS_DATA.forEach(reel => {
        results.push({
          type: 'reel',
          id: reel.id,
          name: reel.title,
          desc: reel.description || '',
          category: reel.category || '',
          image: reel.thumbnail || '',
          reelUrl: reel.reelUrl || '',
          searchText: [
            reel.title, reel.description, reel.category, reel.location,
            ...(reel.tags || [])
          ].join(' ').toLowerCase()
        });
      });
    }

    return results;
  }

  function search(query) {
    const index = buildIndex();
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return index.filter(item => {
      return terms.every(term => item.searchText.includes(term));
    }).slice(0, 8); // Limit to 8 results
  }

  function showResults(query) {
    const results = search(query);

    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="search-dropdown-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>No se encontraron resultados para "${escapeHtml(query)}"</span>
        </div>
      `;
      dropdown.classList.add('visible');
      return;
    }

    dropdown.innerHTML = results.map(item => {
      const icon = item.type === 'reel' 
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      
      const typeLabel = item.type === 'reel' ? 'Reel' : 'Lugar';
      const ratingHtml = item.rating ? `<span class="search-result-rating">★ ${item.rating}</span>` : '';

      return `
        <button class="search-result-item" data-type="${item.type}" data-id="${item.id}">
          ${item.image ? `<img class="search-result-thumb" src="${item.image}" alt="" loading="lazy">` : ''}
          <div class="search-result-info">
            <div class="search-result-name">${highlightMatch(item.name, query)}</div>
            <div class="search-result-meta">
              <span class="search-result-type">${icon} ${typeLabel}</span>
              ${item.category ? `<span class="search-result-category">${item.category}</span>` : ''}
              ${ratingHtml}
            </div>
          </div>
        </button>
      `;
    }).join('');

    // Add "Ver todos" link
    dropdown.innerHTML += `
      <button class="search-result-view-all" data-query="${escapeHtml(query)}">
        Ver todos los resultados para "${escapeHtml(query)}"
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    `;

    // Bind click events
    dropdown.querySelectorAll('.search-result-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        handleResultClick(type, id);
      });
    });

    dropdown.querySelectorAll('.search-result-view-all').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.query;
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
          searchInput.value = q;
          searchInput.dispatchEvent(new Event('input'));
          hideDropdown();
          const scrollTarget = document.getElementById('main-content-layout');
          if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          window.location.href = 'index.html?q=' + encodeURIComponent(q);
        }
      });
    });

    dropdown.classList.add('visible');
  }

  function showQuickTags() {
    dropdown.innerHTML = `
      <div class="search-quick-tags">
        <span class="search-quick-label">Búsquedas populares</span>
        <div class="search-tags-grid">
          ${QUICK_TAGS.map(tag => `
            <button class="search-quick-tag" data-query="${tag.query}">${tag.label}</button>
          `).join('')}
        </div>
      </div>
    `;

    dropdown.querySelectorAll('.search-quick-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        searchInput.value = btn.dataset.query;
        searchInput.dispatchEvent(new Event('input'));
        showResults(btn.dataset.query);
        const scrollTarget = document.getElementById('main-content-layout');
        if (scrollTarget) {
          scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    dropdown.classList.add('visible');
  }

  function handleResultClick(type, id) {
    hideDropdown();
    if (type === 'place') {
      // Navigate to index and focus
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        if (typeof window.focusPlace === 'function') {
          window.focusPlace(id);
        }
      } else {
        window.location.href = 'index.html?focus=' + encodeURIComponent(id);
      }
    } else if (type === 'reel') {
      // If on quien-soy.html (has reels), open the modal
      if (typeof window.openReelModal === 'function') {
        window.openReelModal(id);
      } else {
        window.location.href = 'quien-soy.html?reel=' + encodeURIComponent(id);
      }
    }
  }

  function hideDropdown() {
    if (dropdown) dropdown.classList.remove('visible');
  }

  function handleUrlQuery() {
    const params = new URLSearchParams(window.location.search);
    
    // Handle ?q= search query
    const q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
      // Trigger search after a slight delay to let page initialize
      setTimeout(() => {
        searchInput.dispatchEvent(new Event('input'));
      }, 500);
    }

    // Handle ?focus= for place focusing
    const focusId = params.get('focus');
    if (focusId) {
      setTimeout(() => {
        if (typeof window.focusPlace === 'function') {
          window.focusPlace(focusId);
        }
      }, 1000);
    }
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
