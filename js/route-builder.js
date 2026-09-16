// route-builder.js - Sistema de Itinerarios & Tableros Múltiples estilo Pinterest / Wanderlog
// Permite crear múltiples listas (ej: "Escapada Romántica", "Ruta de Cafés", "Cabañas Soñadas"),
// planificar para hoy o para fechas futuras, exportar a Google Calendar, descargar iCal (.ics) y Google Maps.
// 100% privado en localStorage sin necesidad de registro ni login.

class RouteManager {
  constructor() {
    this.storageKey = 'mama_santi_user_itineraries_v2';
    this.legacyKey = 'mama_santi_user_route';
    this.state = this.loadState();
    this.listeners = [];
    this.initDOM();
  }

  // Cargar estado persistente con compatibilidad hacia atrás
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.boards && parsed.boards.length > 0) {
          return parsed;
        }
      }

      // Migrar ruta previa legacy si existía
      let legacyStops = [];
      try {
        const legacy = localStorage.getItem(this.legacyKey);
        if (legacy) legacyStops = JSON.parse(legacy);
      } catch (e) {}

      // Crear tablero inicial por defecto (fecha sugerida: próximo fin de semana)
      const defaultDate = this.getDefaultTripDate();
      const defaultBoard = {
        id: 'board_principal',
        name: 'Mi Escapada a Puerto Varas',
        tripDate: defaultDate,
        tripTime: '10:00',
        createdAt: new Date().toISOString(),
        stops: legacyStops
      };

      const initialState = {
        activeBoardId: 'board_principal',
        boards: [defaultBoard]
      };

      this.saveState(initialState);
      return initialState;
    } catch (e) {
      console.error('Error al cargar itinerarios', e);
      return {
        activeBoardId: 'board_principal',
        boards: [{
          id: 'board_principal',
          name: 'Mi Escapada a Puerto Varas',
          tripDate: this.getDefaultTripDate(),
          tripTime: '10:00',
          createdAt: new Date().toISOString(),
          stops: []
        }]
      };
    }
  }

  saveState(state = this.state) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
      this.notifyListeners();
    } catch (e) {
      console.error('Error al guardar estado de itinerarios', e);
    }
  }

  getDefaultTripDate() {
    // Sábado más cercano a futuro (7 días después)
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d.toISOString().split('T')[0];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
    this.updateBadges();
    this.updateCardButtons();
    this.renderDrawerContent();
  }

  // Obtener tablero activo
  getActiveBoard() {
    const board = this.state.boards.find(b => b.id === this.state.activeBoardId);
    return board || this.state.boards[0];
  }

  // Cambiar tablero activo
  setActiveBoard(boardId) {
    const exists = this.state.boards.some(b => b.id === boardId);
    if (exists) {
      this.state.activeBoardId = boardId;
      this.saveState();
      this.showToast(`Itinerario activo: "${this.getActiveBoard().name}"`, 'info');
    }
  }

  // Crear nuevo tablero (Estilo listas de Pinterest)
  createBoard(name, tripDate = null) {
    const cleanName = (name || '').trim();
    if (!cleanName) return null;

    const newBoard = {
      id: 'board_' + Date.now(),
      name: cleanName,
      tripDate: tripDate || this.getDefaultTripDate(),
      tripTime: '10:00',
      createdAt: new Date().toISOString(),
      stops: []
    };

    this.state.boards.push(newBoard);
    this.state.activeBoardId = newBoard.id;
    this.saveState();
    this.showToast(`✨ Nueva lista creada: "${cleanName}"`);
    return newBoard;
  }

  // Eliminar tablero
  deleteBoard(boardId) {
    if (this.state.boards.length <= 1) {
      alert('Debes conservar al menos una lista de viaje.');
      return false;
    }

    const board = this.state.boards.find(b => b.id === boardId);
    if (!board) return false;

    if (confirm(`¿Eliminar la lista "${board.name}" y sus ${board.stops.length} paradas?`)) {
      this.state.boards = this.state.boards.filter(b => b.id !== boardId);
      if (this.state.activeBoardId === boardId) {
        this.state.activeBoardId = this.state.boards[0].id;
      }
      this.saveState();
      this.showToast(`Lista eliminada`, 'info');
      return true;
    }
    return false;
  }

  // Actualizar fecha del viaje
  updateBoardDate(boardId, newDate) {
    const board = this.state.boards.find(b => b.id === boardId);
    if (board) {
      board.tripDate = newDate;
      this.saveState();
    }
  }

  // Agregar lugar / parada
  addPlace(placeId, targetBoardId = null) {
    const place = this.resolvePlace(placeId);
    if (!place) return false;

    // Si no se especificó tablero y el usuario tiene más de 1 lista, abrir selector de tableros
    if (!targetBoardId && this.state.boards.length > 1) {
      this.openSaveToBoardModal(place);
      return true;
    }

    const board = targetBoardId 
      ? this.state.boards.find(b => b.id === targetBoardId) 
      : this.getActiveBoard();

    if (!board) return false;

    const alreadyExists = board.stops.some(p => p.id === place.id);
    if (alreadyExists) {
      board.stops = board.stops.filter(p => p.id !== place.id);
      this.saveState();
      this.showToast(`Eliminado de "${board.name}": ${place.name}`, 'info');
      return false;
    } else {
      board.stops.push(place);
      this.saveState();
      this.showToast(`📌 Agregado a "${board.name}": ${place.name}`);
      this.triggerPinAnimation(place.id);
      return true;
    }
  }

  removePlace(placeId, boardId = null) {
    const board = boardId 
      ? this.state.boards.find(b => b.id === boardId) 
      : this.getActiveBoard();

    if (!board) return false;
    const index = board.stops.findIndex(p => p.id === placeId);
    if (index !== -1) {
      const removed = board.stops.splice(index, 1)[0];
      this.saveState();
      this.showToast(`Eliminado de "${board.name}": ${removed.name}`, 'info');
      return true;
    }
    return false;
  }

  movePlace(index, direction, boardId = null) {
    const board = boardId 
      ? this.state.boards.find(b => b.id === boardId) 
      : this.getActiveBoard();

    if (!board) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= board.stops.length) return;

    const temp = board.stops[index];
    board.stops[index] = board.stops[targetIndex];
    board.stops[targetIndex] = temp;
    this.saveState();
  }

  isInRoute(placeId) {
    const board = this.getActiveBoard();
    return board ? board.stops.some(p => p.id === placeId) : false;
  }

  // Buscar objeto de lugar (desde PLACES_DATA o desde REELS_DATA)
  resolvePlace(placeId) {
    if (typeof getPlaceById === 'function') {
      const p = getPlaceById(placeId);
      if (p) return p;
    }

    if (typeof REELS_DATA !== 'undefined') {
      const reel = REELS_DATA.find(r => r.id === placeId || r.shortcode === placeId || `reel-${r.id}` === placeId);
      if (reel) {
        return {
          id: `reel-${reel.id}`,
          name: reel.lugar,
          categoryBadge: reel.categoriaLabel,
          rating: 5.0,
          reviewsCount: 150,
          image: reel.poster || reel.fallbackPoster,
          personalTip: reel.descripcion,
          address: reel.direccion || 'Puerto Varas / Llanquihue',
          coordinates: { lat: -41.3196, lng: -72.9851 },
          duration: "1.5 horas",
          whatsapp: reel.whatsapp,
          airbnbUrl: reel.airbnbUrl,
          instagram: reel.handle
        };
      }
    }
    return null;
  }

  // Cálculo de tiempo estimado
  getEstimatedTime(board = this.getActiveBoard()) {
    if (!board || board.stops.length === 0) return '0 hrs';
    const totalHours = (board.stops.length * 1.5).toFixed(1);
    return `${totalHours} hrs sugeridas`;
  }

  // Cálculo de días restantes hasta el viaje
  getDaysUntilTrip(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trip = new Date(dateStr + 'T00:00:00');
    const diffTime = trip - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '¡El viaje es hoy!';
    if (diffDays === 1) return '¡El viaje es mañana!';
    if (diffDays > 1) return `Faltan ${diffDays} días`;
    return 'Fecha pasada';
  }

  // Generar URL para Google Calendar
  generateGoogleCalendarUrl(board = this.getActiveBoard()) {
    if (!board || board.stops.length === 0) return '#';

    const tripDate = board.tripDate || this.getDefaultTripDate();
    const dateFormatted = tripDate.replace(/-/g, '');
    // Horario: 10:00 AM a 18:00 PM
    const startIso = `${dateFormatted}T100000`;
    const endIso = `${dateFormatted}T180000`;

    const title = encodeURIComponent(`Ruta Puerto Varas: ${board.name}`);
    const location = encodeURIComponent('Puerto Varas, Región de Los Lagos, Chile');

    // Armar resumen detallado de las paradas con tips y Airbnb
    let descLines = [
      `Itinerario curado por María José (@datitosdelajose):`,
      `Fecha: ${tripDate} | Total: ${board.stops.length} paradas (${this.getEstimatedTime(board)})\n`
    ];

    board.stops.forEach((stop, i) => {
      descLines.push(`${i + 1}. ${stop.name}`);
      descLines.push(`   Ubicación: ${stop.address || 'Puerto Varas'}`);
      if (stop.personalTip) descLines.push(`   Tip: "${stop.personalTip}"`);
      if (stop.airbnbUrl) descLines.push(`   Airbnb / Reservar: ${stop.airbnbUrl}`);
      if (stop.whatsapp) descLines.push(`   Contacto: ${stop.whatsapp}`);
      descLines.push('');
    });

    const gmapsUrl = this.generateGoogleMapsUrl(board);
    if (gmapsUrl && gmapsUrl !== '#') {
      descLines.push(`Ruta completa en Google Maps: ${gmapsUrl}`);
    }

    const details = encodeURIComponent(descLines.join('\n'));

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  // Generar archivo iCal (.ics) descargable para Apple Calendar / Outlook / Google
  downloadIcsFile(board = this.getActiveBoard()) {
    if (!board || board.stops.length === 0) return;

    const tripDate = board.tripDate || this.getDefaultTripDate();
    const dateClean = tripDate.replace(/-/g, '');
    const startIso = `${dateClean}T100000`;
    const endIso = `${dateClean}T180000`;

    const descLines = board.stops.map((s, i) => 
      `${i + 1}. ${s.name} (${s.address || 'Puerto Varas'}) - Tip: ${s.personalTip || ''}${s.airbnbUrl ? ' - Airbnb: ' + s.airbnbUrl : ''}`
    ).join('\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Datitos de la Jose//Itinerario Puerto Varas//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${board.id}-${Date.now()}@datitosdelajose.cl`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Ruta Puerto Varas: ${board.name}`,
      `DESCRIPTION:${descLines}`,
      `LOCATION:Puerto Varas, Región de Los Lagos, Chile`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Itinerario_${board.name.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('📥 Calendario .ics descargado con éxito');
  }

  // Generar ruta de Google Maps
  generateGoogleMapsUrl(board = this.getActiveBoard()) {
    if (!board || board.stops.length === 0) return '#';
    const coordsPath = board.stops
      .map(p => `${p.coordinates.lat},${p.coordinates.lng}`)
      .join('/');
    return `https://www.google.com/maps/dir/${coordsPath}`;
  }

  getUberUrlForPlace(place) {
    if (!place) return '#';
    const dropoffAddress = encodeURIComponent(`${place.name}, ${place.address}`);
    return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${place.coordinates.lat}&dropoff[longitude]=${place.coordinates.lng}&dropoff[formatted_address]=${dropoffAddress}`;
  }

  getUberUrlForFirstStop(board = this.getActiveBoard()) {
    if (!board || board.stops.length === 0) return '#';
    return this.getUberUrlForPlace(board.stops[0]);
  }

  triggerPinAnimation(placeId) {
    const btn = document.querySelector(`[data-pin-id="${placeId}"]`);
    if (btn) {
      btn.classList.add('pin-bounce');
      setTimeout(() => btn.classList.remove('pin-bounce'), 600);
    }
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${type === 'success' ? '✨' : 'ℹ️'}</div>
      <div class="toast-text">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  updateBadges() {
    const activeBoard = this.getActiveBoard();
    const count = activeBoard ? activeBoard.stops.length : 0;
    const badges = document.querySelectorAll('.route-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
      b.classList.add('badge-pop');
      setTimeout(() => b.classList.remove('badge-pop'), 300);
    });

    const routeButtons = document.querySelectorAll('.btn-route-toggle');
    routeButtons.forEach(btn => {
      if (count > 0) {
        btn.classList.add('has-items');
      } else {
        btn.classList.remove('has-items');
      }
    });
  }

  updateCardButtons() {
    const buttons = document.querySelectorAll('[data-pin-id]');
    buttons.forEach(btn => {
      const id = btn.getAttribute('data-pin-id');
      const inRoute = this.isInRoute(id);
      const isReel = id && id.startsWith('reel-');
      if (inRoute) {
        btn.classList.add('is-pinned');
        btn.innerHTML = `
          <svg class="pin-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>En tu ruta</span>
        `;
      } else {
        btn.classList.remove('is-pinned');
        btn.innerHTML = `
          <svg class="pin-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>${isReel ? '+ Agregar a ruta' : '+ Agregar a mi ruta'}</span>
        `;
      }
    });
  }

  toggleDrawer(forceState) {
    const drawer = document.getElementById('route-drawer');
    const overlay = document.getElementById('route-drawer-overlay');
    if (!drawer) return;

    const isOpen = drawer.classList.contains('is-open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;

    if (shouldOpen) {
      drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      document.body.classList.add('drawer-open-lock');
      this.renderDrawerContent();
    } else {
      drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      document.body.classList.remove('drawer-open-lock');
    }
  }

  // Renderizar el contenido completo del Drawer con Selector de Tableros & Google Calendar
  renderDrawerContent() {
    const activeBoard = this.getActiveBoard();
    const container = document.getElementById('route-stops-list');
    const emptyState = document.getElementById('route-empty-state');
    const footerActions = document.getElementById('route-drawer-footer');
    const countSpan = document.getElementById('drawer-stops-count');
    const timeSpan = document.getElementById('drawer-est-time');

    if (!container || !activeBoard) return;

    // Selector de Tableros / Listas
    let boardSelectorWrap = document.getElementById('drawer-boards-selector-wrap');
    if (!boardSelectorWrap) {
      const drawerBody = document.querySelector('.drawer-body');
      if (drawerBody) {
        boardSelectorWrap = document.createElement('div');
        boardSelectorWrap.id = 'drawer-boards-selector-wrap';
        boardSelectorWrap.className = 'drawer-boards-selector-wrap';
        drawerBody.insertBefore(boardSelectorWrap, drawerBody.firstChild);
      }
    }

    if (boardSelectorWrap) {
      const daysCountdown = this.getDaysUntilTrip(activeBoard.tripDate);
      boardSelectorWrap.innerHTML = `
        <div class="board-selector-bar">
          <div class="board-select-box">
            <label class="board-select-label">📂 Tu Lista Activa:</label>
            <div class="board-select-row">
              <select id="select-active-board" class="select-active-board" onchange="window.routeManager.setActiveBoard(this.value)">
                ${this.state.boards.map(b => `
                  <option value="${b.id}" ${b.id === activeBoard.id ? 'selected' : ''}>
                    ${b.name} (${b.stops.length} ${b.stops.length === 1 ? 'parada' : 'paradas'})
                  </option>
                `).join('')}
              </select>
              <button type="button" class="btn-new-board" onclick="window.routeManager.promptNewBoard()" title="Crear nueva lista estilo Pinterest">
                ➕
              </button>
            </div>
          </div>

          <div class="trip-date-box">
            <div class="trip-date-header">
              <label class="trip-date-label">📅 Fecha del Viaje:</label>
              ${daysCountdown ? `<span class="trip-days-badge">${daysCountdown}</span>` : ''}
            </div>
            <input 
              type="date" 
              class="trip-date-input" 
              value="${activeBoard.tripDate || ''}"
              onchange="window.routeManager.updateBoardDate('${activeBoard.id}', this.value)"
            >
          </div>
        </div>
      `;
    }

    if (countSpan) countSpan.textContent = `${activeBoard.stops.length} ${activeBoard.stops.length === 1 ? 'parada' : 'paradas'}`;
    if (timeSpan) timeSpan.textContent = this.getEstimatedTime(activeBoard);

    if (activeBoard.stops.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      container.style.display = 'none';
      if (footerActions) footerActions.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'block';
    if (footerActions) footerActions.style.display = 'block';

    // Generar paradas
    container.innerHTML = activeBoard.stops.map((place, index) => {
      const uberUrl = this.getUberUrlForPlace(place);
      const isFirst = index === 0;
      const isLast = index === activeBoard.stops.length - 1;

      return `
        <div class="route-stop-card" data-stop-index="${index}">
          <div class="stop-number-badge">${index + 1}</div>
          <div class="stop-thumb" style="background-image: url('${place.image}')"></div>
          <div class="stop-details">
            <div class="stop-category">${place.categoryBadge}</div>
            <h4 class="stop-title">${place.name}</h4>
            <div class="stop-meta">
              <span>★ ${place.rating}</span> · <span>${place.duration || '1.5 hrs'}</span>
            </div>
            <div class="stop-tip-quote">"${place.personalTip}"</div>
            <div class="stop-links">
              <a href="${uberUrl}" target="_blank" rel="noopener" class="stop-uber-btn" title="Pedir Uber a esta parada">
                🚗 Pedir Uber
              </a>
              ${place.airbnbUrl ? `
                <a href="${place.airbnbUrl}" target="_blank" rel="noopener" class="stop-airbnb-btn" title="Ver anuncio en Airbnb / Reservar">
                  🏡 Ver en Airbnb
                </a>
              ` : ''}
              ${place.whatsapp ? `
                <a href="https://wa.me/${place.whatsapp.replace(/[^0-9]/g, '')}?text=Hola!%20Tengo%20guardado%20${encodeURIComponent(place.name)}%20en%20mi%20ruta%20de%20Mamá%20Santi%20y%20quiero%20hacer%20una%20consulta." target="_blank" rel="noopener" class="stop-wa-btn" title="Consultar por WhatsApp">
                  💬 WhatsApp
                </a>
              ` : ''}
            </div>
          </div>
          <div class="stop-actions">
            <button class="stop-reorder-btn" onclick="window.routeManager.movePlace(${index}, -1)" ${isFirst ? 'disabled' : ''} title="Subir orden">▲</button>
            <button class="stop-reorder-btn" onclick="window.routeManager.movePlace(${index}, 1)" ${isLast ? 'disabled' : ''} title="Bajar orden">▼</button>
            <button class="stop-remove-btn" onclick="window.routeManager.removePlace('${place.id}')" title="Quitar de mi ruta">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Actualizar botones de acción del footer
    if (footerActions) {
      const gcalUrl = this.generateGoogleCalendarUrl(activeBoard);
      const gmapsUrl = this.generateGoogleMapsUrl(activeBoard);
      const uberFirstUrl = this.getUberUrlForFirstStop(activeBoard);

      footerActions.innerHTML = `
        <a href="${gcalUrl}" target="_blank" rel="noopener" class="btn-gcalendar-full" title="Agendar este viaje en Google Calendar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
          </svg>
          <span>Agendar Ruta en Google Calendar</span>
        </a>

        <a href="${gmapsUrl}" target="_blank" rel="noopener" class="btn-gmaps-full" title="Abrir ruta encadenada en Google Maps">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          <span>Abrir ruta completa en Google Maps</span>
        </a>

        <div class="drawer-secondary-actions-row">
          <button type="button" class="btn-download-ics" onclick="window.routeManager.downloadIcsFile()" title="Descargar archivo de calendario para Apple/Outlook">
            📥 Descargar iCal (.ics)
          </button>
          <a href="${uberFirstUrl}" target="_blank" rel="noopener" class="btn-uber-first">
            🚗 Uber al 1° destino
          </a>
        </div>

        <div class="drawer-sub-actions">
          <button class="btn-clear-all" onclick="window.routeManager.clearActiveBoard()">Vaciar paradas de esta lista</button>
          ${this.state.boards.length > 1 ? `
            <button class="btn-delete-board" onclick="window.routeManager.deleteBoard('${activeBoard.id}')">Eliminar esta lista</button>
          ` : ''}
        </div>
      `;
    }
  }

  // Modal selector cuando el usuario tiene múltiples tableros y hace clic en guardar
  openSaveToBoardModal(place) {
    let modal = document.getElementById('saveToBoardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'saveToBoardModal';
      modal.className = 'save-board-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="save-board-backdrop" onclick="this.parentElement.classList.remove('active')"></div>
      <div class="save-board-card">
        <div class="save-board-header">
          <div class="save-board-thumb" style="background-image:url('${place.image}')"></div>
          <div>
            <span class="save-board-subtitle">Guardar recomendación</span>
            <h4 class="save-board-title">${place.name}</h4>
          </div>
          <button class="save-board-close" onclick="this.closest('.save-board-modal').classList.remove('active')">✕</button>
        </div>

        <div class="save-board-list">
          <label class="save-board-list-label">Elige un tablero de viaje:</label>
          ${this.state.boards.map(b => {
            const isSaved = b.stops.some(p => p.id === place.id);
            return `
              <div class="save-board-option ${isSaved ? 'already-saved' : ''}" onclick="window.routeManager.togglePlaceOnSpecificBoard('${place.id}', '${b.id}')">
                <div class="save-board-opt-name">
                  <span>${b.name}</span>
                  <small>${b.stops.length} paradas · ${b.tripDate || 'Sin fecha'}</small>
                </div>
                <div class="save-board-opt-badge">
                  ${isSaved ? '✓ Guardado' : '+ Guardar'}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="save-board-new-row">
          <input type="text" id="new-board-name-input" class="new-board-input" placeholder="Crear nueva lista (ej: Cabañas con Tinaja)">
          <button type="button" class="btn-new-board-submit" onclick="window.routeManager.submitNewBoardWithPlace('${place.id}')">
            Crear y guardar
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  togglePlaceOnSpecificBoard(placeId, boardId) {
    this.addPlace(placeId, boardId);
    const modal = document.getElementById('saveToBoardModal');
    if (modal) modal.classList.remove('active');
  }

  submitNewBoardWithPlace(placeId) {
    const input = document.getElementById('new-board-name-input');
    if (!input || !input.value.trim()) return;
    const newBoard = this.createBoard(input.value.trim());
    if (newBoard) {
      this.addPlace(placeId, newBoard.id);
      const modal = document.getElementById('saveToBoardModal');
      if (modal) modal.classList.remove('active');
    }
  }

  promptNewBoard() {
    const name = prompt('Nombre de tu nueva lista de viaje (ej: "Día de Lluvia & Küchens", "Cabañas con Tinaja"):');
    if (name && name.trim()) {
      this.createBoard(name.trim());
    }
  }

  clearActiveBoard() {
    const board = this.getActiveBoard();
    if (!board || board.stops.length === 0) return;
    if (confirm(`¿Vaciar todas las paradas de "${board.name}"?`)) {
      board.stops = [];
      this.saveState();
      this.showToast(`Lista "${board.name}" reiniciada`, 'info');
    }
  }

  initDOM() {
    document.addEventListener('click', (e) => {
      // Toggle Drawer
      if (e.target.closest('.btn-route-toggle') || e.target.closest('#btn-header-route')) {
        e.preventDefault();
        this.toggleDrawer();
      }

      // Cerrar Drawer
      if (e.target.closest('.btn-close-drawer') || e.target.closest('#route-drawer-overlay')) {
        this.toggleDrawer(false);
      }

      // Botón Agregar Parada
      const pinBtn = e.target.closest('[data-pin-id]');
      if (pinBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = pinBtn.getAttribute('data-pin-id');
        this.addPlace(id);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleDrawer(false);
        const saveModal = document.getElementById('saveToBoardModal');
        if (saveModal) saveModal.classList.remove('active');
      }
    });
  }
}

// Inicializar globalmente
document.addEventListener('DOMContentLoaded', () => {
  window.routeManager = new RouteManager();
});
