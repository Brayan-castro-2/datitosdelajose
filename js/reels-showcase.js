// reels-showcase.js - Motor interactivo del Showcase de Reels para Mamá Santi (@datitosdelajose)
// Inspirado en la arquitectura de showcase audiovisual de Santi (landing 2)

let currentReelsFilter = 'all';
let isShowingAllReels = false;

document.addEventListener('DOMContentLoaded', () => {
  initReelsShowcase();
  initReelModal();
});

function initReelsShowcase() {
  renderReelsGallery('all', false);

  // Botones de filtro de categorías
  const filterBtns = document.querySelectorAll('.reels-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReelsFilter = btn.dataset.filter || 'all';
      isShowingAllReels = false;
      renderReelsGallery(currentReelsFilter, false);
    });
  });

  // Botón "Ver Todos los Videos"
  const verTodosBtn = document.getElementById('btnVerTodosReels');
  if (verTodosBtn) {
    verTodosBtn.addEventListener('click', () => {
      isShowingAllReels = !isShowingAllReels;
      renderReelsGallery(currentReelsFilter, isShowingAllReels);
    });
  }
}

function renderReelsGallery(activeFilter = 'all', showAll = false) {
  window.renderReelsGallery = renderReelsGallery;
  const desktopContainer = document.getElementById('reelsGridDesktop');
  const verTodosBtn = document.getElementById('btnVerTodosReels');
  const verTodosWrap = document.getElementById('verTodosContainer');
  const countBadge = document.getElementById('reelsFilterCount');

  if (!desktopContainer || typeof REELS_DATA === 'undefined') return;

  // Filtrado
  const filtered = REELS_DATA.filter(item => {
    if (activeFilter === 'all') return true;
    return item.categoria === activeFilter;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} videos`;
  }

  // Límite inicial: 6 videos si no está expandido
  const INITIAL_LIMIT = 6;
  const displayList = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);

  // Control del botón Ver Todos
  if (verTodosWrap && verTodosBtn) {
    if (filtered.length <= INITIAL_LIMIT) {
      verTodosWrap.style.display = 'none';
    } else {
      verTodosWrap.style.display = 'flex';
      verTodosBtn.innerHTML = showAll
        ? `<span>Mostrar Menos</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`
        : `<span>Ver Todos los Videos (${filtered.length} Reels)</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
    }
  }

  // Render Grid Desktop
  desktopContainer.innerHTML = displayList.map(item => `
    <article class="reel-card-item" data-id="${item.id}">
      <div class="reel-media-box" onclick="openReelModal(${item.id})">
        <img 
          src="${item.poster}" 
          alt="${item.titulo}" 
          class="reel-cover-img" 
          loading="lazy" 
          onerror="this.onerror=null; this.src='${item.fallbackPoster}';"
        >
        <div class="reel-play-overlay" title="Reproducir Reel">
          <div class="reel-play-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
          </div>
        </div>
        <div class="reel-badge-top">
          <span class="reel-pill-highlight">${item.vistas}</span>
          <span class="reel-pill-category">${item.categoriaLabel}</span>
        </div>
        ${item.airbnbUrl ? `
          <div class="reel-airbnb-ribbon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Opción Airbnb</span>
          </div>
        ` : ''}
      </div>

      <div class="reel-info-bar">
        <div class="reel-brand-header">
          <div class="reel-avatar-wrap">
            <img src="thumbs/maria_jose_post.jpg" alt="María José" class="reel-avatar-img" onerror="this.src='thumbs/thumb_${item.shortcode}.jpg'">
          </div>
          <div class="reel-brand-names">
            <h3 class="reel-brand-title">${item.lugar}</h3>
            <p class="reel-brand-handle">${item.handle}</p>
          </div>
        </div>

        <p class="reel-card-description">"${item.descripcion}"</p>

        <div class="reel-card-actions">
          <div class="reel-actions-primary">
            <button type="button" class="btn-reel-play" onclick="openReelModal(${item.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
              <span>Ver Reel</span>
            </button>

            <button type="button" class="btn-reel-pin" data-pin-id="reel-${item.id}" title="Agregar a mi ruta">
              <svg class="pin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Agregar a ruta</span>
            </button>
          </div>

          ${(item.airbnbUrl || item.whatsappUrl) ? `
            <div class="reel-actions-secondary">
              ${item.airbnbUrl ? `
                <a href="${item.airbnbUrl}" target="_blank" rel="noopener" class="btn-reel-airbnb" title="Ver en Airbnb">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>Airbnb</span>
                </a>
              ` : ''}

              ${item.whatsappUrl ? `
                <a href="${item.whatsappUrl}" target="_blank" rel="noopener" class="btn-reel-wa" title="Consultar por WhatsApp">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.071.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.419-.101.824z"/></svg>
                  <span>WhatsApp</span>
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

// ============================================================================
// MODAL DE REEL INTERACTIVO (Lazy Embed Iframe de Instagram & Airbnb)
// ============================================================================
function openReelModal(id) {
  if (typeof REELS_DATA === 'undefined') return;
  const item = REELS_DATA.find(v => v.id === id);
  if (!item) return;

  const modal = document.getElementById('reelModal');
  if (!modal) return;

  document.getElementById('reelModalCategory').textContent = item.categoriaLabel;
  document.getElementById('reelModalTitle').textContent = item.titulo;
  document.getElementById('reelModalLugar').textContent = item.lugar;
  document.getElementById('reelModalBadge').textContent = item.vistas;
  document.getElementById('reelModalDesc').textContent = item.descripcion;

  // Detalles adicionales
  const detallesEl = document.getElementById('reelModalDetalles');
  if (detallesEl) {
    detallesEl.textContent = item.detalles || '';
    detallesEl.style.display = item.detalles ? 'block' : 'none';
  }

  // Botón Airbnb
  const airbnbBtn = document.getElementById('reelModalAirbnbBtn');
  if (airbnbBtn) {
    if (item.airbnbUrl) {
      airbnbBtn.href = item.airbnbUrl;
      airbnbBtn.style.display = 'inline-flex';
    } else {
      airbnbBtn.style.display = 'none';
    }
  }

  // Botón WhatsApp
  const waBtn = document.getElementById('reelModalWaBtn');
  if (waBtn) {
    if (item.whatsappUrl) {
      waBtn.href = item.whatsappUrl;
      waBtn.style.display = 'inline-flex';
    } else {
      waBtn.style.display = 'none';
    }
  }

  // Botón Guardar en Itinerario
  const pinBtn = document.getElementById('reelModalPinBtn');
  if (pinBtn) {
    const isSaved = window.routeManager ? window.routeManager.isInRoute(`reel-${item.id}`) : false;
    pinBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        ${isSaved ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
      </svg>
      <span>${isSaved ? '✓ En tu ruta de viaje' : '+ Agregar a mi ruta'}</span>
    `;
    pinBtn.onclick = () => {
      if (window.routeManager) {
        window.routeManager.addPlace(`reel-${item.id}`);
        const nowSaved = window.routeManager.isInRoute(`reel-${item.id}`);
        pinBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${nowSaved ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
          </svg>
          <span>${nowSaved ? '✓ En tu ruta de viaje' : '+ Agregar a mi ruta'}</span>
        `;
      }
    };
  }

  // Enlace externo a Instagram
  const igBtn = document.getElementById('reelModalIgLink');
  if (igBtn) igBtn.href = item.url;

  // Inyectar selector de otros reels recomendados
  const reelsRow = document.getElementById('reelModalOtherReels');
  if (reelsRow) {
    const others = REELS_DATA.filter(r => r.id !== item.id).slice(0, 8);
    reelsRow.innerHTML = others.map(r => `
      <div class="modal-other-reel-thumb" onclick="openReelModal(${r.id})" title="${r.titulo}">
        <img src="${r.poster}" alt="${r.lugar}" onerror="this.onerror=null; this.src='${r.fallbackPoster}';">
        <div class="modal-other-reel-overlay">
          <span class="modal-other-badge">${r.vistas}</span>
        </div>
      </div>
    `).join('');
  }

  // Inyectar el Iframe oficial de Instagram
  const mediaBox = document.getElementById('reelModalMediaBox');
  if (mediaBox) {
    mediaBox.innerHTML = `
      <div class="reel-iframe-wrapper">
        <iframe 
          src="https://www.instagram.com/reel/${item.shortcode}/embed/" 
          class="reel-instagram-iframe"
          frameborder="0" 
          scrolling="no" 
          allowtransparency="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
      </div>
    `;
  }

  modal.classList.add('active');
  document.body.classList.add('drawer-open-lock');
}

function closeReelModal() {
  const modal = document.getElementById('reelModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('drawer-open-lock');
  const mediaBox = document.getElementById('reelModalMediaBox');
  if (mediaBox) mediaBox.innerHTML = '';
}

function initReelModal() {
  const modal = document.getElementById('reelModal');
  const backdrop = document.getElementById('reelModalBackdrop');
  const closeBtn = document.getElementById('reelModalClose');

  if (closeBtn) closeBtn.addEventListener('click', closeReelModal);
  if (backdrop) backdrop.addEventListener('click', closeReelModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeReelModal();
    }
  });
}

window.openReelModal = openReelModal;
window.closeReelModal = closeReelModal;
