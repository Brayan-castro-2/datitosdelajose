// app.js - Lógica interactiva principal para Datitos de la Jose · Puerto Varas
// Controla el carrusel Hero, el mapa Leaflet, filtros por clima/mood, buscador y renderizado de tarjetas.

// Cola de navegación previa a inicialización completa
window.pendingMobileNav = null;
window.setMobileNav = function(mode, isInitial) {
  window.pendingMobileNav = { mode, isInitial };
};

document.addEventListener('DOMContentLoaded', () => {
  initHeroCarousel();
  initPlacesApp();

  function checkHashOrUrlNav() {
    const hash = (window.location.hash || '').toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = (urlParams.get('view') || urlParams.get('tab') || '').toLowerCase();

    if (hash.includes('map') || viewParam === 'map') {
      if (typeof window.setMobileNav === 'function') {
        window.setMobileNav('map', true);
      }
      setTimeout(() => {
        if (typeof window.setMobileNav === 'function') {
          window.setMobileNav('map', true);
        }
      }, 100);
    } else if (hash.includes('explorar') || hash.includes('feed') || viewParam === 'feed' || viewParam === 'explorar') {
      if (typeof window.setMobileNav === 'function') {
        window.setMobileNav('feed', true);
      }
    }
  }

  checkHashOrUrlNav();
  window.addEventListener('hashchange', checkHashOrUrlNav);
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
  
  // Paginación y Scroll Infinito (de 30 en 30)
  const PAGE_SIZE = 30;
  let visibleCount = PAGE_SIZE;
  let scrollObserver = null;

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

    // Usar MarkerClusterGroup con emotes inteligentes para agrupar zonas concurridas
    if (typeof L.markerClusterGroup === 'function') {
      markersLayer = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 42,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const markers = cluster.getAllChildMarkers();
          const count = cluster.getChildCount();

          const catCounts = {};
          const emojiCounts = {};
          markers.forEach(m => {
            const cat = m.options.placeCategory || 'gastronomia';
            const em = m.options.placeEmoji || '📍';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
            emojiCounts[em] = (emojiCounts[em] || 0) + 1;
          });

          // Determinar emote más repetido en la zona
          let dominantEmoji = '🍽️';
          let maxEmojiCount = 0;
          for (const [em, c] of Object.entries(emojiCounts)) {
            if (c > maxEmojiCount) {
              maxEmojiCount = c;
              dominantEmoji = em;
            }
          }

          let dominantCat = 'gastronomia';
          let maxCatCount = 0;
          for (const [cat, c] of Object.entries(catCounts)) {
            if (c > maxCatCount) {
              maxCatCount = c;
              dominantCat = cat;
            }
          }

          const color = CATEGORY_COLORS[dominantCat] || '#ea580c';

          return L.divIcon({
            className: 'custom-cluster-marker-wrap',
            html: `
              <div class="custom-map-cluster-bubble" style="
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: #ffffff;
                border: 2.5px solid ${color};
                border-radius: 9999px;
                padding: 4px 10px 4px 8px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.32);
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-weight: 800;
                font-size: 13px;
                color: #191c1f;
                cursor: pointer;
                white-space: nowrap;
              ">
                <span style="font-size: 16px; line-height: 1;">${dominantEmoji}</span>
                <span style="line-height: 1; color: ${color}; font-weight: 800;">${count}</span>
              </div>
            `,
            iconSize: [52, 34],
            iconAnchor: [26, 17]
          });
        }
      });
    } else {
      markersLayer = L.layerGroup();
    }
    markersLayer.addTo(mapInstance);

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
    initRouteLayers();
    window.updateRouteOnMap(false);
  }

  const CATEGORY_COLORS = {
    gastronomia: '#ea580c',
    hospedaje: '#2563eb',
    tiendas: '#7c3aed',
    turismo: '#059669',
    bienestar: '#db2777',
    lluvia: '#0284c7',
    despejado: '#d97706',
    tragos: '#dc2626'
  };

  const CATEGORY_EMOJIS = {
    gastronomia: '🍽️',
    hospedaje: '🏡',
    turismo: '🌲',
    tiendas: '🛍️',
    bienestar: '🧖',
    lluvia: '☕',
    despejado: '☀️',
    tragos: '🍷'
  };

  // Helper para asignar el emote más específico a cada negocio
  function getPlaceEmoji(place) {
    const name = (place.name || '').toLowerCase();
    const tip = (place.personalTip || '').toLowerCase();
    const tags = (place.tags || []).join(' ').toLowerCase();
    const combined = name + ' ' + tip + ' ' + tags;

    if (combined.includes('café') || combined.includes('cafe') || combined.includes('küchen') || combined.includes('kuchen') || combined.includes('pasteler') || combined.includes('tostadur') || combined.includes('desayuno')) return '☕';
    if (combined.includes('pizza') || combined.includes('pizzeria')) return '🍕';
    if (combined.includes('cerveza') || combined.includes('bar') || combined.includes('pub') || combined.includes('cocktail') || combined.includes('trago') || combined.includes('vino')) return '🍷';
    if (combined.includes('hamburguesa') || combined.includes('burger')) return '🍔';
    if (combined.includes('helad')) return '🍦';
    if (combined.includes('sushi')) return '🍣';
    if (combined.includes('chocolate') || combined.includes('dulce')) return '🍫';
    if (combined.includes('cabaña') || combined.includes('lodge') || combined.includes('hotel') || combined.includes('refugio') || combined.includes('hostal') || combined.includes('camping') || combined.includes('airbnb')) return '🏡';
    if (combined.includes('tinaja') || combined.includes('spa') || combined.includes('masaje') || combined.includes('terma') || combined.includes('piscina')) return '🧖';
    if (combined.includes('mirador') || combined.includes('parque') || combined.includes('volcán') || combined.includes('lago') || combined.includes('salto') || combined.includes('playa') || combined.includes('kayak') || combined.includes('trekking')) return '🌲';
    if (combined.includes('tienda') || combined.includes('artesania') || combined.includes('librería') || combined.includes('souvenir') || combined.includes('queso') || combined.includes('mercado')) return '🛍️';

    return CATEGORY_EMOJIS[place.category] || '📍';
  }

  function createCustomPinIcon(place) {
    const category = place.category;
    const color = CATEGORY_COLORS[category] || '#ea580c';
    const emoji = getPlaceEmoji(place);

    return L.divIcon({
      className: 'custom-leaflet-marker-wrapper',
      html: `
        <div class="custom-emote-pin" data-marker-id="${place.id}" style="
          width: 38px;
          height: 38px;
          background: #ffffff;
          border: 2.5px solid ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 19px;
            line-height: 1;
            user-select: none;
            display: inline-block;
          ">${emoji}</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  }

  function renderMapMarkers(shouldFitBounds = false) {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();
    markerMap.clear();

    const filtered = getFilteredPlaces();

    filtered.forEach(place => {
      const placeEmoji = getPlaceEmoji(place);
      const customIcon = createCustomPinIcon(place);
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
        icon: customIcon,
        placeCategory: place.category,
        placeEmoji: placeEmoji
      });

      const uberUrl = window.routeManager ? window.routeManager.getUberUrlForPlace(place) : '#';
      const socials = typeof getSocialsFromItem === 'function' ? getSocialsFromItem(place) : { instagram: place.businessInstagram, whatsapp: place.whatsapp };

      const popupContent = `
        <div class="popup-card-content">
          <img class="popup-img" src="${place.image}" alt="${place.name}" loading="lazy" onerror="this.onerror=null; this.src='${place.fallbackImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}';" />
          <div class="popup-info">
            <div style="font-size:0.7rem; font-weight:700; color:var(--color-terracotta);">${place.categoryBadge}</div>
            <h4 class="popup-title">${place.name}</h4>
            <div style="font-size:0.75rem; color:#b45309; font-weight:800; margin-bottom:0.3rem;">★ ${place.rating} (${place.reviewsCount} reseñas)</div>
            <div class="popup-tip">"${place.personalTip}"</div>
            <div class="popup-actions" style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-top:0.5rem;">
              <button class="btn-pin-add" data-pin-id="${place.id}" style="padding:0.4rem 0.65rem; font-size:0.75rem;">
                + A mi ruta
              </button>
              <button type="button" class="btn-uber-mini" onclick="window.openPostDetailModal('${place.id}')" style="padding:0.4rem 0.65rem; background:#E1306C; color:white; border:none; cursor:pointer;" title="Ver detalle y video">
                Ver Detalle / Reel
              </button>
              <a href="${place.gmapsUrl}" target="_blank" rel="noopener" class="btn-uber-mini" style="padding:0.4rem 0.65rem; background:#1a73e8; color:white; text-decoration:none; display:inline-flex; align-items:center; gap:4px;" title="Abrir ubicación en Google Maps">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                Google Maps
              </a>
              ${socials.instagram ? `
                <a href="${socials.instagramUrl}" target="_blank" rel="noopener" class="btn-uber-mini" style="padding:0.4rem 0.65rem; background:linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%); color:white; text-decoration:none;" title="Instagram @${socials.instagram}">
                  @${socials.instagram}
                </a>
              ` : ''}
              ${socials.whatsapp ? `
                <a href="${socials.whatsappUrl}" target="_blank" rel="noopener" class="btn-uber-mini" style="padding:0.4rem 0.65rem; background:#25D366; color:white; text-decoration:none;" title="WhatsApp (+56 9...)">
                  WhatsApp
                </a>
              ` : ''}
              <a href="${uberUrl}" target="_blank" rel="noopener" class="btn-uber-mini" style="padding:0.4rem 0.65rem;">
                Uber
              </a>
              ${place.airbnbUrl ? `
                <a href="${place.airbnbUrl}" target="_blank" rel="noopener" class="btn-airbnb-mini" style="padding:0.4rem 0.65rem;" title="Ver en Airbnb">
                  Airbnb
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { 
        maxWidth: 290,
        minWidth: 250,
        className: 'custom-leaflet-popup',
        autoPan: true,
        autoPanPaddingTopLeft: [20, 170],
        autoPanPaddingBottomRight: [20, 80],
        offset: [0, -25]
      });

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

    const isMobile = window.innerWidth <= 860;

    // Asegurar visibilidad del mapa
    const mapWrapper = document.getElementById('map-sticky-wrapper');

    if (isMobile) {
      // En celular, cambiar a vista mapa y sincronizar barra Spotify
      setLayout('map');
      document.querySelectorAll('.s-nav-item').forEach(b => b.classList.remove('active'));
      const sMapBtn = document.getElementById('s-nav-map');
      if (sMapBtn) sMapBtn.classList.add('active');
    } else {
      if (activeLayout === 'feed') {
        setLayout('split');
      }
    }

    if (mapWrapper) {
      mapWrapper.style.display = 'flex';
      // En móvil, hacer scroll suave directo al contenedor del mapa
      mapWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      mapInstance.invalidateSize();
      // En móvil, desplazar centro un poco al norte para que el popup entre perfectamente debajo del header
      const targetLat = isMobile ? place.coordinates.lat + 0.0035 : place.coordinates.lat;
      mapInstance.flyTo([targetLat, place.coordinates.lng], 16, {
        duration: 0.8
      });

      setTimeout(() => {
        const marker = markerMap.get(placeId);
        if (marker) {
          if (markersLayer && typeof markersLayer.zoomToShowLayer === 'function') {
            markersLayer.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          } else {
            marker.openPopup();
          }
        }
      }, 400);
    }, 250);
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

  // Filtrado de Lugares y Promociones
  function getFilteredPlaces() {
    const dataList = (typeof PLACES_DATA !== 'undefined' && Array.isArray(PLACES_DATA))
      ? PLACES_DATA
      : ((typeof PROMOS_DATA !== 'undefined' && Array.isArray(PROMOS_DATA)) ? PROMOS_DATA : []);

    return dataList.filter(place => {
      const matchCategory = currentCategory === 'all' || place.category === currentCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (place.name && place.name.toLowerCase().includes(q)) ||
        (place.personalTip && place.personalTip.toLowerCase().includes(q)) ||
        (place.shortDesc && place.shortDesc.toLowerCase().includes(q)) ||
        (place.address && place.address.toLowerCase().includes(q)) ||
        (place.discount && place.discount.toLowerCase().includes(q)) ||
        (place.howToRedeem && place.howToRedeem.toLowerCase().includes(q)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(q)));

      return matchCategory && matchQuery;
    });
  }

  // Renderizar Tarjetas en el Grid (con Paginación / Scroll Infinito de 30 en 30)
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
          <h3 style="font-family: var(--font-display); font-weight:800; font-size:1.3rem;">No encontramos promociones con ese filtro</h3>
          <p style="color: var(--color-text-secondary); margin-top: 0.4rem;">Prueba seleccionando "Todas las Promos" o busca por restaurante o beneficio.</p>
          <button class="btn-hero-primary" onclick="resetFilters()" style="margin-top:1.5rem;">Ver todas las promos</button>
        </div>
      `;
      return;
    }

    const visibleItems = filtered.slice(0, visibleCount);

    const isPromosPage = window.location.pathname.includes('promos') || (typeof PLACES_DATA === 'undefined' || !Array.isArray(PLACES_DATA) || (PLACES_DATA.length > 0 && String(PLACES_DATA[0].id).startsWith('PROMO-')));
    const hasLeafletMap = !!document.getElementById('leaflet-map');

    const cardsHtml = visibleItems.map(place => {
      const isPinned = window.routeManager ? window.routeManager.isInRoute(place.id) : false;
      const uberUrl = window.routeManager ? window.routeManager.getUberUrlForPlace(place) : '#';
      const socials = typeof getSocialsFromItem === 'function' ? getSocialsFromItem(place) : { instagram: place.businessInstagram, whatsapp: place.whatsapp };

      const hasCoords = !!(place.coordinates && place.coordinates.lat && place.coordinates.lng);
      const gmapsUrl = place.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Puerto Varas')}`;
      const addressDisplay = place.address || place.schedule || (place.benefitType ? `Beneficio: ${place.benefitType}` : 'Puerto Varas');

      return `
        <article class="pinterest-card" data-id="${place.id}" style="cursor:pointer;" onclick="if(!event.target.closest('.btn-pin-add') && !event.target.closest('a') && !event.target.closest('.btn-locate-map') && !event.target.closest('.btn-promo-video-action')) window.handleCardClick('${place.id}')">
          <div class="card-image-wrap" onclick="event.stopPropagation(); window.openPostDetailModal('${place.id}')" title="Ver publicación completa y video">
            <img class="card-img" src="${place.image}" alt="${place.name}" loading="lazy" onerror="this.onerror=null; this.src='${place.fallbackImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}';" />
            <div class="card-floating-badge">${place.categoryBadge}</div>
            ${place.status ? `<div class="card-status-badge" style="position:absolute; top:12px; right:12px; z-index:4; background:${place.status === 'Activo' ? '#16a34a' : '#64748b'}; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 9px; border-radius:9999px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">${place.status === 'Activo' ? '🟢 Activo' : '⚪ Finalizado'}</div>` : `<div class="card-rating-badge">★ ${place.rating}</div>`}
            <div class="curator-tag-overlay">${isPromosPage ? '🎁 Sorteo & Promo Oficial' : 'Dato de la Jose'}</div>
            ${(place.videoUrl || place.shortCode) ? `
              <div class="card-video-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Video Reel</span>
              </div>
            ` : ''}
          </div>
          <div class="card-body">
            <h3 class="card-title" onclick="event.stopPropagation(); window.openPostDetailModal('${place.id}')">${place.name}</h3>

            ${place.discount ? `
              <div class="card-promo-discount-badge" style="display:flex; align-items:center; gap:6px; background:#fff1f2; color:#e11d48; font-weight:800; font-size:0.86rem; padding:6px 10px; border-radius:8px; margin-bottom:8px; border:1px solid #fecdd3;">
                <span>✨ ${place.discount}</span>
              </div>
            ` : ''}

            <div class="card-address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${addressDisplay}</span>
            </div>

            ${place.howToRedeem ? `
              <div class="card-how-to-redeem" style="font-size:0.8rem; color:#475569; background:#f8fafc; border-left:3px solid #059669; padding:5px 8px; border-radius:4px; margin:6px 0 10px 0;">
                <strong style="color:#059669;">¿Cómo canjear?:</strong> ${place.howToRedeem}
              </div>
            ` : ''}

            ${(socials.instagram || socials.whatsapp) ? `
              <div class="card-biz-links-row" onclick="event.stopPropagation();">
                ${socials.instagram ? `
                  <a href="${socials.instagramUrl}" target="_blank" rel="noopener" class="card-biz-pill-ig" title="Ir al Instagram de @${socials.instagram}">
                    @${socials.instagram}
                  </a>
                ` : ''}
                ${socials.whatsapp ? `
                  <a href="${socials.whatsappUrl}" target="_blank" rel="noopener" class="card-biz-pill-wa" title="Escribir por WhatsApp">
                    WhatsApp
                  </a>
                ` : ''}
              </div>
            ` : ''}
            
            <div class="card-personal-quote" onclick="event.stopPropagation(); window.openPostDetailModal('${place.id}')">
              <span class="quote-label">${isPromosPage ? 'Detalle de la Promo / Sorteo:' : 'Mi recomendación personal:'}</span>
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
                  <span>Agregar a mi ruta</span>
                `}
              </button>

              ${(hasLeafletMap && hasCoords) ? `
                <button type="button" class="btn-card-map-action is-map-view" onclick="event.stopPropagation(); window.focusPlace('${place.id}');" title="Ver en el mapa interactivo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                  <span>Ver en el mapa</span>
                </button>
              ` : ''}

              <a href="${gmapsUrl}" target="_blank" rel="noopener" class="btn-card-map-action is-gmaps" onclick="event.stopPropagation();" title="Abrir ubicación en Google Maps">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Ver en Google Maps</span>
              </a>

              ${isPromosPage ? `
                <button type="button" class="btn-uber-mini btn-promo-video-action" onclick="event.stopPropagation(); window.openPostDetailModal('${place.id}')" style="background:linear-gradient(45deg, #f09433, #dc2743, #bc1888); color:#fff; font-weight:700; border:none; cursor:pointer;" title="Ver publicación oficial y video">
                  Ver Video
                </button>
              ` : `
                <a href="${uberUrl}" target="_blank" rel="noopener" class="btn-uber-mini" onclick="event.stopPropagation();" title="Pedir Uber directo a este lugar">
                  Uber
                </a>
              `}

              ${place.airbnbUrl ? `
                <a href="${place.airbnbUrl}" target="_blank" rel="noopener" class="btn-airbnb-mini" onclick="event.stopPropagation();" title="Ver en Airbnb / Reservar">
                  Airbnb
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Centinela de Scroll Infinito (30 en 30)
    let loadMoreHtml = '';
    if (visibleCount < filtered.length) {
      loadMoreHtml = `
        <div class="infinite-scroll-container" id="infinite-scroll-sentinel">
          <div class="infinite-scroll-count">
            Mostrando <strong>${visibleItems.length}</strong> de <strong>${filtered.length}</strong> recomendaciones de la Jose
          </div>
          <button type="button" class="btn-load-more" id="btn-load-more-places">
            <span>Cargar más lugares y videos (+30)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      `;
    }

    cardsContainer.innerHTML = cardsHtml + loadMoreHtml;

    // Conectar IntersectionObserver para scroll suave y automático
    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) {
      if (scrollObserver) scrollObserver.disconnect();
      scrollObserver = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          visibleCount += PAGE_SIZE;
          renderCards();
        }
      }, { rootMargin: '300px' });
      scrollObserver.observe(sentinel);

      const btnLoadMore = document.getElementById('btn-load-more-places');
      if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
          visibleCount += PAGE_SIZE;
          renderCards();
        });
      }
    }

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
      visibleCount = PAGE_SIZE; // Resetear al cambiar de categoría
      renderCards();
      renderMapMarkers();
    });
  });

  // Buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      visibleCount = PAGE_SIZE; // Resetear al filtrar
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
  window.focusPlaceOnMap = focusPlaceOnMap;
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
  
  // Capas Leaflet dedicadas al Caminito Rojo Interactivo de la Ruta
  let routeLineLayer = null;
  let routeSequenceMarkersLayer = null;

  function initRouteLayers() {
    if (!mapInstance) return;
    if (!routeLineLayer) routeLineLayer = L.layerGroup().addTo(mapInstance);
    if (!routeSequenceMarkersLayer) routeSequenceMarkersLayer = L.layerGroup().addTo(mapInstance);
  }

  function updateRouteSummaryBadge(stopsCount, km, time) {
    let badgeEl = document.getElementById('map-route-summary-floating-badge');
    const canvasWrap = document.querySelector('.map-canvas-container');
    const stickyWrap = document.querySelector('.map-sticky-wrapper');
    const targetWrap = canvasWrap || stickyWrap;
    const hintEl = document.getElementById('map-floating-hint');
    if (!targetWrap) return;

    if (stopsCount < 2) {
      if (badgeEl) badgeEl.style.display = 'none';
      if (hintEl && window.innerWidth > 900) hintEl.style.display = 'flex';
      return;
    }

    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'map-route-summary-floating-badge';
      badgeEl.className = 'map-floating-route-summary';
      targetWrap.appendChild(badgeEl);
    } else if (badgeEl.parentElement !== targetWrap) {
      targetWrap.appendChild(badgeEl);
    }

    if (hintEl) hintEl.style.display = 'none';
    badgeEl.style.display = 'flex';
    const infoText = km ? `<strong>${km} km</strong> (${time})` : `calculando curvas...`;
    badgeEl.innerHTML = `
      <div class="route-summary-left">
        <span class="route-pulse-icon">📍</span>
        <span><strong>${stopsCount} paradas</strong> · ${infoText}</span>
      </div>
      <button type="button" onclick="window.fitMapToRoute()" class="btn-fit-route" title="Ver todo el recorrido">
        🔍 Ver ruta
      </button>
    `;
  }

  // Caminito Rojo Interactivo: Conecta las paradas añadidas y sigue carreteras con OSRM
  window.updateRouteOnMap = function(fitBounds = false) {
    if (!mapInstance) return;
    initRouteLayers();

    routeLineLayer.clearLayers();
    routeSequenceMarkersLayer.clearLayers();

    if (!window.routeManager) return;
    const board = window.routeManager.getActiveBoard();
    if (!board || !board.stops || board.stops.length === 0) {
      updateRouteSummaryBadge(0, 0, 0);
      return;
    }

    const validStops = board.stops.filter(s => s.coordinates && s.coordinates.lat && s.coordinates.lng);
    if (validStops.length === 0) {
      updateRouteSummaryBadge(0, 0, 0);
      return;
    }

    // Agregar pines numerados ①, ②, ③ con aro brillante para cada parada
    validStops.forEach((stop, index) => {
      const numIcon = L.divIcon({
        className: 'route-sequence-marker-container',
        html: `
          <div class="route-number-badge" data-route-stop-id="${stop.id}">
            <span class="route-badge-num">${index + 1}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
        icon: numIcon,
        zIndexOffset: 1200 + index
      });

      marker.bindPopup(`
        <div class="popup-card-content" style="min-width:210px;">
          <div style="font-size:0.75rem; font-weight:800; color:#E60023; display:flex; align-items:center; gap:4px;">
            <span>📍 Parada ${index + 1} de tu Ruta</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:800; margin:0.25rem 0;">${stop.name}</h4>
          <div style="font-size:0.78rem; color:#555; margin-bottom:0.45rem;">${stop.address || stop.zone}</div>
          <div style="font-size:0.75rem; color:#b45309; font-style:italic; margin-bottom:0.5rem;">"${stop.personalTip || ''}"</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn-uber-mini" onclick="window.openPostDetailModal('${stop.id}')" style="padding:4px 8px; font-size:0.75rem; background:#E60023; color:white; border:none;">👁️ Ver detalle</button>
            <button type="button" class="btn-uber-mini" onclick="window.routeManager.removePlace('${stop.id}')" style="padding:4px 8px; font-size:0.75rem; background:#f3f4f6; color:#333;">Quitar parada</button>
          </div>
        </div>
      `);

      marker.addTo(routeSequenceMarkersLayer);
    });

    if (validStops.length >= 2) {
      const coords = validStops.map(s => [s.coordinates.lat, s.coordinates.lng]);

      // Trazado instantáneo: Caminito rojo con resplandor y línea animada
      L.polyline(coords, {
        color: '#E60023',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLineLayer);

      L.polyline(coords, {
        color: '#E60023',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '10, 12',
        className: 'animated-route-polyline'
      }).addTo(routeLineLayer);

      updateRouteSummaryBadge(validStops.length, null, null);

      // Consulta OSRM para seguir las curvas exactas de calles y carreteras del lago
      const osrmCoords = validStops.map(s => `${s.coordinates.lng},${s.coordinates.lat}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const r = data.routes[0];
            const roadPoints = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

            routeLineLayer.clearLayers();
            L.polyline(roadPoints, {
              color: '#E60023',
              weight: 9,
              opacity: 0.35,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLineLayer);

            L.polyline(roadPoints, {
              color: '#E60023',
              weight: 4.5,
              opacity: 0.95,
              dashArray: '10, 12',
              className: 'animated-route-polyline'
            }).addTo(routeLineLayer);

            const km = (r.distance / 1000).toFixed(1);
            const min = Math.round(r.duration / 60);
            const timeStr = min >= 60 ? `${Math.floor(min/60)}h ${min%60}m` : `${min} min`;
            updateRouteSummaryBadge(validStops.length, km, timeStr);
          }
        })
        .catch(() => {
          // Si falla o no hay conexión, se mantiene el trazo directo suave
        });

      if (fitBounds) {
        mapInstance.fitBounds(L.latLngBounds(coords).pad(0.2));
      }
    } else {
      updateRouteSummaryBadge(validStops.length, 0, 0);
    }
  };

  window.fitMapToRoute = function() {
    if (!mapInstance || !window.routeManager) return;
    const board = window.routeManager.getActiveBoard();
    if (!board || !board.stops) return;
    const valid = board.stops.filter(s => s.coordinates && s.coordinates.lat && s.coordinates.lng);
    if (valid.length > 0) {
      const coords = valid.map(s => [s.coordinates.lat, s.coordinates.lng]);
      mapInstance.fitBounds(L.latLngBounds(coords).pad(0.25));
    }
  };

  // Control de navegación móvil estilo Spotify (con un solo pulgar)
  function setMobileNav(mode, isInitial = false) {
    document.querySelectorAll('.s-nav-item').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`s-nav-${mode}`);
    if (targetBtn) targetBtn.classList.add('active');

    if (mode === 'feed') {
      document.body.classList.remove('mobile-map-active');
      setLayout(window.innerWidth <= 900 ? 'feed' : 'split');
      const exploreSec = document.getElementById('cards-grid-container') || document.getElementById('explorar');
      if (exploreSec && !isInitial) {
        exploreSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (mode === 'map') {
      document.body.classList.add('mobile-map-active');
      setLayout(window.innerWidth <= 900 ? 'map' : 'split');
      const mapEl = document.getElementById('map-sticky-wrapper') || document.getElementById('mapa-section') || document.getElementById('leaflet-map');
      if (mapEl) {
        mapEl.style.display = 'flex';
        if (window.innerWidth <= 900) {
          window.scrollTo({ top: 0, behavior: isInitial ? 'auto' : 'smooth' });
        } else {
          const scrollBehavior = isInitial ? 'auto' : 'smooth';
          setTimeout(() => {
            mapEl.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
          }, isInitial ? 40 : 120);
        }
      }
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
          fitMapToMarkers();
        }, 150);
      }
    } else if (mode === 'route') {
      if (window.routeManager && typeof window.routeManager.openDrawer === 'function') {
        window.routeManager.openDrawer();
      } else {
        const btnHeaderRoute = document.getElementById('btn-header-route');
        if (btnHeaderRoute) btnHeaderRoute.click();
      }
    }
  }

  window.setMobileNav = setMobileNav;
  window.setLayout = setLayout;
  window.fitMapToMarkers = fitMapToMarkers;
  window.getMapInstance = () => mapInstance;

  initLeafletMap();
  renderCards();

  if (window.pendingMobileNav) {
    const { mode, isInitial } = window.pendingMobileNav;
    window.pendingMobileNav = null;
    setMobileNav(mode, isInitial);
  }
}

/* ==========================================================================
   3. EXTRACCIÓN DINÁMICA DE REDES SOCIALES Y CONTACTO DIRECTO
   ========================================================================== */
function getSocialsFromItem(item) {
  if (!item) return { instagram: null, instagramUrl: null, whatsapp: null, whatsappDisplay: null, whatsappUrl: null };

  if (item.businessInstagram || item.whatsappUrl) {
    return {
      instagram: item.businessInstagram,
      instagramUrl: item.businessInstagramUrl || (item.businessInstagram ? `https://www.instagram.com/${item.businessInstagram}/` : null),
      whatsapp: item.whatsapp,
      whatsappDisplay: item.whatsappDisplay || item.whatsapp,
      whatsappUrl: item.whatsappUrl || (item.whatsapp ? `https://wa.me/${item.whatsapp}` : null)
    };
  }

  const caption = item.fullCaption || item.descripcion || item.personalTip || '';
  const mentions = caption.match(/@([a-zA-Z0-9._]+)/g) || [];
  const bizMentions = mentions
    .map(m => m.replace('@', '').replace(/[.,;:!?]+$/, '').trim())
    .filter(m => m.toLowerCase() !== 'datitosdelajose' && m.length > 1);

  const instagram = bizMentions.length > 0 ? bizMentions[0] : null;

  let whatsapp = null;
  let waDisplay = null;
  const waRegex = /(?:whatsapp|wsp|ws|fono|teléfono|contacto|reservas|al)?[\s.:]*(\+?56\s?9\s?\d{4}\s?\d{3,4}|\+?56\s?9\s?\d{7,8}|\b9\s?\d{4}\s?\d{4}\b|\b9\d{8}\b)/i;
  const waMatch = caption.match(waRegex);

  if (waMatch) {
    const raw = waMatch[1].replace(/\D/g, '');
    if (raw.startsWith('569') && (raw.length === 11 || raw.length === 10)) {
      whatsapp = raw;
      waDisplay = `+${raw}`;
    } else if (raw.startsWith('9') && raw.length === 9) {
      whatsapp = '56' + raw;
      waDisplay = `+56 ${raw}`;
    } else if (raw.length === 8 || raw.length === 7) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    }
  }

  return {
    instagram,
    instagramUrl: instagram ? `https://www.instagram.com/${instagram}/` : null,
    whatsapp,
    whatsappDisplay: waDisplay || (whatsapp ? `+${whatsapp}` : null),
    whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : null
  };
}

/* ==========================================================================
   4. MODAL DE PUBLICACIÓN COMPLETA Y REPRODUCTOR INLINE DE VIDEO
   ========================================================================== */
function findPlaceOrReel(id) {
  if (typeof PLACES_DATA !== 'undefined' && Array.isArray(PLACES_DATA)) {
    const p = PLACES_DATA.find(x => String(x.id) === String(id));
    if (p) return p;
  }
  if (typeof PROMOS_DATA !== 'undefined' && Array.isArray(PROMOS_DATA)) {
    const pr = PROMOS_DATA.find(x => String(x.id) === String(id));
    if (pr) return pr;
  }
  if (typeof REELS_DATA !== 'undefined' && Array.isArray(REELS_DATA)) {
    const r = REELS_DATA.find(x => String(x.id) === String(id) || String(x.shortcode) === String(id));
    if (r) return r;
  }
  return null;
}

function getPlaceById(id) {
  return findPlaceOrReel(id);
}

function handleCardClick(placeId) {
  const mapElement = document.getElementById('leaflet-map');
  openPostDetailModal(placeId);
}

function openPostDetailModal(id) {
  const item = findPlaceOrReel(id);
  if (!item) return;

  const modal = document.getElementById('postDetailModal');
  if (!modal) return;

  const mediaBox = document.getElementById('postModalMediaBox');
  const catEl = document.getElementById('postModalCategory');
  const dateEl = document.getElementById('postModalDate');
  const titleEl = document.getElementById('postModalTitle');
  const addrEl = document.getElementById('postModalAddress');
  const ratingEl = document.getElementById('postModalRating');
  const captionEl = document.getElementById('postModalFullCaption');
  const pinBtn = document.getElementById('postModalPinBtn');
  const uberBtn = document.getElementById('postModalUberBtn');
  const igBtn = document.getElementById('postModalIgBtn');
  const bizIgBtn = document.getElementById('postModalBizIgBtn');
  const bizIgText = document.getElementById('postModalBizIgText');
  const bizWaBtn = document.getElementById('postModalBizWaBtn');
  const bizWaText = document.getElementById('postModalBizWaText');
  const airbnbBtn = document.getElementById('postModalAirbnbBtn');

  if (catEl) catEl.textContent = item.categoryBadge || item.categoriaLabel || 'Recomendación';
  
  if (dateEl) {
    if (item.date) {
      try {
        const d = new Date(item.date);
        dateEl.textContent = d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch(e) {
        dateEl.textContent = '';
      }
    } else {
      dateEl.textContent = '';
    }
  }

  if (titleEl) titleEl.textContent = item.name || item.titulo || 'Recomendación de Jose';
  if (addrEl) addrEl.textContent = item.address || item.lugar || 'Puerto Varas';

  if (ratingEl) {
    const likes = item.reviewsCount || item.likesCount || 0;
    ratingEl.innerHTML = `❤️ ${likes} personas interesadas &bull; ★ ${item.rating || '4.8'}`;
  }

  if (captionEl) {
    const text = item.fullCaption || item.descripcion || item.personalTip || '';
    captionEl.innerHTML = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/(@[a-zA-Z0-9._]+)/g, '<strong style="color:var(--color-pin-red);">$1</strong>')
      .replace(/(#[a-zA-Z0-9._]+)/g, '<span style="color:#0284c7;">$1</span>');
  }

  // Reproductor de Video Directo o Iframe Embed Interactivo de Instagram
  if (mediaBox) {
    const code = item.shortcode || item.shortCode;
    const directVideoUrl = item.videoUrl;
    const posterImg = item.image || item.poster || item.fallbackPoster || '';

    if (code) {
      mediaBox.innerHTML = `
        <div style="position:relative; width:100%; display:flex; flex-direction:column; align-items:center; background:#000; border-radius:14px; overflow:hidden;">
          <video 
            src="/api/video-stream?code=${code}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="${posterImg}"
            style="width:100%; max-height:70vh; object-fit:contain; background:#000;"
            onerror="this.onerror=null; this.parentElement.innerHTML = \`
              <iframe 
                src='https://www.instagram.com/reel/${code}/embed/' 
                style='width:100%; height:490px; border:none; background:#fff;' 
                frameborder='0' 
                scrolling='no' 
                allowtransparency='true' 
                allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'>
              </iframe>
              <div style='padding:0.75rem 1rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:center; box-sizing:border-box;'>
                <a href='https://www.instagram.com/reel/${code}/' target='_blank' rel='noopener' style='display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:0.75rem 1.2rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.9rem; text-decoration:none; border-radius:9999px; box-shadow:0 4px 14px rgba(225,48,108,0.4); text-align:center;'>
                  <span>▶ Ver Reel en Instagram (@datitosdelajose)</span>
                </a>
              </div>
            \`;"
          >
          </video>
          <div style="padding:0.55rem 0.85rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; gap:8px;">
            <span style="color:#a1a1aa; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span> Video de Instagram
            </span>
            <a href="https://www.instagram.com/reel/${code}/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; padding:0.4rem 0.85rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.78rem; text-decoration:none; border-radius:9999px;">
              <span>Abrir en Instagram ↗</span>
            </a>
          </div>
        </div>
      `;
    } else if (directVideoUrl) {
      mediaBox.innerHTML = `
        <div style="position:relative; width:100%; height:100%; min-height:420px; display:flex; align-items:center; justify-content:center; background:#000; border-radius:14px; overflow:hidden;">
          <video 
            src="${directVideoUrl}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="${posterImg}"
            style="width:100%; height:100%; max-height:70vh; object-fit:contain; border-radius:12px;"
            onerror="this.parentElement.innerHTML='<img src=\\'${posterImg}\\' style=\\'width:100%; max-height:70vh; object-fit:contain; border-radius:12px;\\'>';">
          </video>
        </div>
      `;
    } else {
      mediaBox.innerHTML = `
        <div style="position:relative; width:100%; height:100%; min-height:420px; display:flex; align-items:center; justify-content:center; background:#111; border-radius:14px; overflow:hidden;">
          <img src="${posterImg}" alt="${item.name || ''}" style="width:100%; height:100%; max-height:70vh; object-fit:contain; border-radius:12px;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';">
        </div>
      `;
    }
  }

  // Extraer información social del negocio recomendado
  const socials = getSocialsFromItem(item);

  // 1. Botón directo al Instagram del Local / Negocio
  if (bizIgBtn) {
    if (socials.instagram) {
      bizIgBtn.href = socials.instagramUrl;
      if (bizIgText) {
        bizIgText.textContent = `Ir al Instagram (@${socials.instagram})`;
      }
      bizIgBtn.style.display = 'inline-flex';
    } else {
      bizIgBtn.style.display = 'none';
    }
  }

  // 2. Botón directo a WhatsApp del Negocio
  if (bizWaBtn) {
    if (socials.whatsapp) {
      bizWaBtn.href = socials.whatsappUrl;
      if (bizWaText) {
        bizWaText.textContent = `Contactar por WhatsApp (${socials.whatsappDisplay})`;
      }
      bizWaBtn.style.display = 'inline-flex';
    } else {
      bizWaBtn.style.display = 'none';
    }
  }

  // 3. Botón directo Airbnb si aplica
  if (airbnbBtn) {
    if (item.airbnbUrl) {
      airbnbBtn.href = item.airbnbUrl;
      airbnbBtn.style.display = 'inline-flex';
    } else {
      airbnbBtn.style.display = 'none';
    }
  }

  // 4. Botón Guardar en mi ruta
  if (pinBtn) {
    const isPinned = window.routeManager ? window.routeManager.isInRoute(item.id) : false;
    pinBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        ${isPinned ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
      </svg>
      <span>${isPinned ? 'En tu ruta de viaje' : 'Agregar a mi ruta'}</span>
    `;
    pinBtn.onclick = () => {
      if (window.routeManager) {
        window.routeManager.addPlace(item.id);
        const nowPinned = window.routeManager.isInRoute(item.id);
        pinBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${nowPinned ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
          </svg>
          <span>${nowPinned ? 'En tu ruta de viaje' : 'Agregar a mi ruta'}</span>
        `;
      }
    };
  }

    // 5. Uber y Google Maps
    window.currentModalPlaceId = item.id;
    const gmapsBtn = document.getElementById('postModalGmapsBtn');
    if (gmapsBtn) {
      gmapsBtn.href = item.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', Puerto Varas, Chile')}`;
    }

    if (uberBtn) {
      const uberUrl = window.routeManager ? window.routeManager.getUberUrlForPlace(item) : '#';
      uberBtn.href = uberUrl;
    }

    // 6. Publicación original en Instagram de Jose
    if (igBtn) {
      igBtn.href = item.url || 'https://www.instagram.com/datitosdelajose/';
    }

    modal.classList.add('active');
  document.body.classList.add('drawer-open-lock');
}

function closePostDetailModal() {
  const modal = document.getElementById('postDetailModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('drawer-open-lock');
  const mediaBox = document.getElementById('postModalMediaBox');
  if (mediaBox) {
    const video = mediaBox.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
    }
    mediaBox.innerHTML = '';
  }
}

// Event listeners globales de cierre de modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePostDetailModal();
  }
});

window.openPostDetailModal = openPostDetailModal;
window.closePostDetailModal = closePostDetailModal;
window.getPlaceById = getPlaceById;
window.handleCardClick = handleCardClick;



  // Menú Lateral Chic
  function toggleSideMenu() {
    const drawer = document.getElementById('side-menu-drawer');
    const overlay = document.getElementById('side-menu-overlay');
    if (!drawer || !overlay) return;
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.classList.remove('drawer-open-lock');
    } else {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.classList.add('drawer-open-lock');
    }
  }
  window.toggleSideMenu = toggleSideMenu;

  // Sincronización del badge de ruta para la barra móvil
  function updateMobileRouteBadge(count) {
    const sBadge = document.getElementById('s-route-badge');
    if (sBadge) {
      if (count > 0) {
        sBadge.textContent = count;
        sBadge.style.display = 'flex';
      } else {
        sBadge.style.display = 'none';
      }
    }
  }

  window.updateMobileRouteBadge = updateMobileRouteBadge;

  // Interceptar la actualización del badge en routeManager si está disponible
  if (window.routeManager) {
    const origUpdateBadge = window.routeManager.updateBadge;
    if (typeof origUpdateBadge === 'function') {
      window.routeManager.updateBadge = function() {
        origUpdateBadge.apply(this, arguments);
        const count = this.route ? this.route.length : 0;
        updateMobileRouteBadge(count);
      };
    }
  }

  
