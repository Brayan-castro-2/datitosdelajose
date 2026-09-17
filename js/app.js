// app.js - Lógica interactiva principal para Datitos de la Jose · Puerto Varas
// Controla el carrusel Hero, el mapa Leaflet, filtros por clima/mood, buscador y renderizado de tarjetas.

document.addEventListener('DOMContentLoaded', () => {
  initHeroCarousel();
  initPlacesApp();
});

/* ==========================================================================
   1. HERO CAROUSEL FOTOGRÁFICO HD
   ========================================================================== */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.carousel-indicators');
  if (!slides.length || !dotsContainer) return;

  let currentSlide = 0;
  let carouselTimer = null;

  // Generar dots dinámicos
  dotsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Ir a slide ${idx + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetTimer();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function resetTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, 6000);
  }

  resetTimer();
}

/* ==========================================================================
   2. EXPLORADOR DE LUGARES, MAPA LEAFLET Y FILTROS
   ========================================================================== */
function initPlacesApp() {
  // Estado local
  let currentCategory = 'all';
  let searchQuery = '';
  let activeLayout = 'split'; // 'split', 'feed', 'map'
  
  // Elementos DOM
  const cardsContainer = document.getElementById('cards-grid-container');
  const moodPills = document.querySelectorAll('.mood-pill-btn');
  const searchInput = document.getElementById('search-input');
  const viewButtons = document.querySelectorAll('.view-btn');
  const mainLayout = document.getElementById('main-content-layout');
  const placesCountDisplay = document.getElementById('places-count-display');

  // Inicializar Leaflet Map
  let mapInstance = null;
  let markersLayer = null;
  const markerMap = new Map(); // place.id -> L.marker

  // Coordenadas equilibradas de la bahía de Puerto Varas y Lago Llanquihue
  const LAGO_LLANQUIHUE_PV_CENTER = [-41.3050, -72.9550];
  const DEFAULT_ZOOM = 12;

  function initLeafletMap() {
    const mapElement = document.getElementById('leaflet-map');
    if (!mapElement) return;

    mapInstance = L.map('leaflet-map', {
      center: LAGO_LLANQUIHUE_PV_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Azulejos limpios y confiables de OpenStreetMap (100% libres, sin API Key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);

    // Botón para centrar en Lago Llanquihue / Puerto Varas
    const resetZoomBtn = document.getElementById('btn-reset-map-zoom');
    if (resetZoomBtn) {
      resetZoomBtn.addEventListener('click', () => {
        mapInstance.flyTo(LAGO_LLANQUIHUE_PV_CENTER, DEFAULT_ZOOM, { duration: 1 });
      });
    }

    // Suavizar el mensaje flotante al hacer zoom
    mapInstance.on('zoomstart', () => {
      const hint = document.getElementById('map-floating-hint');
      if (hint) hint.style.opacity = '0.5';
    });
    mapInstance.on('zoomend', () => {
      const hint = document.getElementById('map-floating-hint');
      if (hint) hint.style.opacity = '1';
    });

    renderMapMarkers(false);
  }

  // Emojis según categoría
  function getCategoryEmoji(category) {
    switch (category) {
      case 'lluvia': return '🌧️';
      case 'despejado': return '☀️';
      case 'tragos': return '🍷';
      case 'aventura': return '🌲';
      case 'hoteles': return '🏨';
      default: return '📍';
    }
  }

  function createCustomPinIcon(category, placeId) {
    const emoji = getCategoryEmoji(category);
    return L.divIcon({
      className: 'custom-leaflet-marker-wrapper',
      html: `<div class="custom-pin-marker" data-marker-id="${placeId}">${emoji}</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20]
    });
  }

  function renderMapMarkers(shouldFitBounds = false) {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();
    markerMap.clear();

    const filtered = getFilteredPlaces();

    filtered.forEach(place => {
      const customIcon = createCustomPinIcon(place.category, place.id);
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon });

      const uberUrl = window.routeManager ? window.routeManager.getUberUrlForPlace(place) : '#';

      const popupContent = `
        <div class="popup-card-content">
          <img class="popup-img" src="${place.image}" alt="${place.name}" loading="lazy" />
          <div class="popup-info">
            <div style="font-size:0.7rem; font-weight:700; color:var(--color-terracotta);">${place.categoryBadge}</div>
            <h4 class="popup-title">${place.name}</h4>
            <div style="font-size:0.75rem; color:#b45309; font-weight:800; margin-bottom:0.3rem;">★ ${place.rating} (${place.reviewsCount} reseñas)</div>
            <div class="popup-tip">"${place.personalTip}"</div>
            <div class="popup-actions">
              <button class="btn-pin-add" data-pin-id="${place.id}" style="padding:0.4rem 0.75rem; font-size:0.78rem;">
                + Agregar a ruta
              </button>
              <a href="${uberUrl}" target="_blank" rel="noopener" class="btn-uber-mini" style="padding:0.4rem 0.65rem;">
                🚗 Uber
              </a>
              ${place.airbnbUrl ? `
                <a href="${place.airbnbUrl}" target="_blank" rel="noopener" class="btn-airbnb-mini" style="padding:0.4rem 0.65rem;" title="Ver en Airbnb / Reservar">
                  🏡 Airbnb
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, className: 'custom-leaflet-popup' });

      marker.on('click', () => {
        // Resaltar tarjeta correspondiente en el feed
        highlightCard(place.id);
      });

      marker.addTo(markersLayer);
      markerMap.set(place.id, marker);
    });

    if (shouldFitBounds && filtered.length > 0 && currentCategory !== 'all') {
      fitMapToMarkers();
    }
  }

  function fitMapToMarkers() {
    if (!mapInstance || markerMap.size === 0) return;
    const group = L.featureGroup(Array.from(markerMap.values()));
    mapInstance.fitBounds(group.getBounds().pad(0.15));
  }

  function focusPlaceOnMap(placeId) {
    const place = getPlaceById(placeId);
    if (!place || !mapInstance) return;

    // Si estamos en vista 'feed', cambiar temporalmente o asegurar visibilidad
    if (activeLayout === 'feed') {
      setLayout('split');
    }

    const layoutEl = document.getElementById('main-content-layout');
    if (layoutEl) {
      layoutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      mapInstance.flyTo([place.coordinates.lat, place.coordinates.lng], 15, {
        duration: 1.2
      });

      const marker = markerMap.get(placeId);
      if (marker) {
        marker.openPopup();
      }

      highlightCard(placeId);
    }, 400);
  }

  function highlightCard(placeId) {
    const card = document.querySelector(`.pinterest-card[data-id="${placeId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.borderColor = 'var(--color-pin-red)';
      card.style.boxShadow = '0 0 0 4px rgba(230, 0, 35, 0.25)';
      setTimeout(() => {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      }, 2500);
    }
  }

  // Filtrado de Lugares
  function getFilteredPlaces() {
    return PLACES_DATA.filter(place => {
      const matchCategory = currentCategory === 'all' || place.category === currentCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        place.name.toLowerCase().includes(q) ||
        place.personalTip.toLowerCase().includes(q) ||
        place.shortDesc.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(q)));

      return matchCategory && matchQuery;
    });
  }

  // Renderizar Tarjetas en el Grid
  function renderCards() {
    if (!cardsContainer) return;

    const filtered = getFilteredPlaces();

    if (placesCountDisplay) {
      placesCountDisplay.textContent = `${filtered.length} lugares encontrados`;
    }

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.8rem;">🔍</div>
          <h3 style="font-family: var(--font-display); font-weight:800; font-size:1.3rem;">No encontramos lugares con ese filtro</h3>
          <p style="color: var(--color-text-secondary); margin-top: 0.4rem;">Prueba con otra palabra clave o selecciona "Todos los Rincones".</p>
          <button class="btn-hero-primary" onclick="resetFilters()" style="margin-top:1.5rem;">Ver todos los lugares</button>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filtered.map(place => {
      const isPinned = window.routeManager ? window.routeManager.isInRoute(place.id) : false;
      const uberUrl = window.routeManager ? window.routeManager.getUberUrlForPlace(place) : '#';

      return `
        <article class="pinterest-card" data-id="${place.id}">
          <div class="card-image-wrap">
            <img class="card-img" src="${place.image}" alt="${place.name}" loading="lazy" />
            <div class="card-floating-badge">${place.categoryBadge}</div>
            <div class="card-rating-badge">★ ${place.rating}</div>
            <div class="curator-tag-overlay">Dato de la Jose</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${place.name}</h3>
            <div class="card-address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${place.address}</span>
            </div>
            
            <div class="card-personal-quote">
              <span class="quote-label">Mi recomendación personal:</span>
              "${place.personalTip}"
            </div>

            <div class="card-actions-row">
              <button class="btn-pin-add ${isPinned ? 'is-pinned' : ''}" data-pin-id="${place.id}">
                ${isPinned ? `
                  <svg class="pin-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>En tu ruta</span>
                ` : `
                  <svg class="pin-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <span>+ Agregar a mi ruta</span>
                `}
              </button>
              <a href="${uberUrl}" target="_blank" rel="noopener" class="btn-uber-mini" title="Pedir Uber directo a este lugar">
                🚗 Uber
              </a>
              ${place.airbnbUrl ? `
                <a href="${place.airbnbUrl}" target="_blank" rel="noopener" class="btn-airbnb-mini" title="Ver en Airbnb / Reservar">
                  🏡 Airbnb
                </a>
              ` : ''}
              <button class="btn-locate-map" onclick="window.focusPlace('${place.id}')" title="Ubicar en el mapa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.routeManager) {
      window.routeManager.updateCardButtons();
    }
  }

  // Cambiar Disposición de Vista
  function setLayout(layout) {
    activeLayout = layout;
    if (!mainLayout) return;

    mainLayout.classList.remove('layout-split', 'layout-feed', 'layout-map');
    mainLayout.classList.add(`layout-${layout}`);

    viewButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === layout) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Controlar visibilidad del contenedor de mapa
    const mapWrapper = document.getElementById('map-sticky-wrapper');
    const cardsGrid = document.getElementById('cards-grid-container');

    if (layout === 'feed') {
      if (mapWrapper) mapWrapper.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'grid';
    } else if (layout === 'map') {
      if (mapWrapper) mapWrapper.style.display = 'flex';
      if (cardsGrid) cardsGrid.style.display = 'none';
      setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);
    } else { // split
      if (mapWrapper) mapWrapper.style.display = 'flex';
      if (cardsGrid) cardsGrid.style.display = 'grid';
      setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);
    }
  }

  // Event Listeners para Filtros por Mood
  moodPills.forEach(pill => {
    pill.addEventListener('click', () => {
      moodPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      renderCards();
      renderMapMarkers();
    });
  });

  // Buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCards();
      renderMapMarkers();
    });
  }

  // Switcher de Vistas
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      setLayout(view);
    });
  });

  // Global helper para botón "Ubicar en mapa"
  window.focusPlace = focusPlaceOnMap;
  window.resetFilters = () => {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    moodPills.forEach(p => {
      if (p.getAttribute('data-category') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });
    renderCards();
    renderMapMarkers();
  };

  // Helper global para filtrar por clima / mood desde el banner inteligente
  window.filterByMood = (category) => {
    currentCategory = category;
    moodPills.forEach(p => {
      if (p.getAttribute('data-category') === category) p.classList.add('active');
      else p.classList.remove('active');
    });
    renderCards();
    renderMapMarkers();
    const explorarEl = document.getElementById('main-content-layout');
    if (explorarEl) {
      explorarEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Inicializar todo
  initLeafletMap();
  renderCards();
}
