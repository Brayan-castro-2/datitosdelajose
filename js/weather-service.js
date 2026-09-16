// weather-service.js - Clima en tiempo real y Hora Local de Puerto Varas
// Utiliza la API pública y gratuita de Open-Meteo para coordenadas de Puerto Varas (lat: -41.3196, lng: -72.9851)
// Ofrece recomendaciones inteligentes según el clima actual (lluvia, despejado, frío).

const PUERTO_VARAS_COORDS = { lat: -41.3196, lng: -72.9851 };
const WEATHER_CACHE_KEY = 'mama_santi_weather_cache';
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutos

class WeatherService {
  constructor() {
    this.weatherData = null;
    this.init();
  }

  async init() {
    this.updateLocalClock();
    setInterval(() => this.updateLocalClock(), 1000);

    await this.fetchWeather();
    this.renderWeatherWidget();
    this.renderSmartBanner();
  }

  // Reloj en tiempo real para Puerto Varas (Zona horaria Chile continental: America/Santiago)
  updateLocalClock() {
    const clockElements = document.querySelectorAll('.live-puerto-varas-clock');
    if (!clockElements.length) return;

    try {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const dateFormatter = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });

      const timeStr = timeFormatter.format(now);
      const dateStr = dateFormatter.format(now);

      clockElements.forEach(el => {
        el.textContent = `${timeStr}`;
        el.setAttribute('title', `Hora actual en Puerto Varas: ${timeStr} (${dateStr})`);
      });
    } catch (e) {
      console.warn('Error formateando reloj', e);
    }
  }

  // Obtener clima desde Open-Meteo
  async fetchWeather() {
    // 1. Revisar caché en sessionStorage
    try {
      const cached = sessionStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
          this.weatherData = parsed.data;
          return;
        }
      }
    } catch (e) {
      // Ignorar error de caché
    }

    // 2. Llamada directa a Open-Meteo
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${PUERTO_VARAS_COORDS.lat}&longitude=${PUERTO_VARAS_COORDS.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=America%2FSantiago`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al consultar clima');
      const data = await res.json();

      this.weatherData = data.current;
      sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: this.weatherData
      }));
    } catch (e) {
      console.warn('No se pudo cargar el clima en vivo, usando datos por defecto:', e);
      // Fallback típico sureño
      this.weatherData = {
        temperature_2m: 11,
        apparent_temperature: 9,
        weather_code: 3,
        rain: 0,
        is_day: 1
      };
    }
  }

  // Interpretar código WMO de clima
  getWeatherCondition(code, isDay = 1) {
    // Tabla oficial WMO
    if (code === 0) return { label: 'Despejado', emoji: isDay ? '☀️' : '🌙', mood: 'despejado' };
    if (code === 1 || code === 2) return { label: 'Parcialmente Nublado', emoji: isDay ? '🌤️' : '☁️', mood: 'despejado' };
    if (code === 3) return { label: 'Nublado', emoji: '☁️', mood: 'lluvia' };
    if (code === 45 || code === 48) return { label: 'Niebla Sureña', emoji: '🌫️', mood: 'lluvia' };
    if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Garúa / Llovizna', emoji: '🌧️', mood: 'lluvia', isRain: true };
    if ([61, 63, 65, 66, 67].includes(code)) return { label: 'Lluvia', emoji: '🌧️', mood: 'lluvia', isRain: true };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Aguanieve / Nieve', emoji: '❄️', mood: 'lluvia', isRain: true };
    if ([80, 81, 82].includes(code)) return { label: 'Chubascos', emoji: '🌦️', mood: 'lluvia', isRain: true };
    if ([95, 96, 99].includes(code)) return { label: 'Tormenta Eléctrica', emoji: '⛈️', mood: 'lluvia', isRain: true };
    return { label: 'Clima Sureño', emoji: '⛅', mood: 'despejado' };
  }

  // Renderizar Chip Clima en el Header
  renderWeatherWidget() {
    if (!this.weatherData) return;

    const temp = Math.round(this.weatherData.temperature_2m);
    const cond = this.getWeatherCondition(this.weatherData.weather_code, this.weatherData.is_day);

    const containers = document.querySelectorAll('.header-weather-widget-slot');
    containers.forEach(slot => {
      slot.innerHTML = `
        <div class="weather-live-chip" title="Clima en vivo en Puerto Varas: ${cond.label}, ${temp}°C">
          <span class="weather-chip-icon">${cond.emoji}</span>
          <span class="weather-chip-temp">${temp}°C</span>
          <span class="weather-chip-divider">·</span>
          <span class="weather-chip-clock">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="live-puerto-varas-clock">--:--</span>
          </span>
        </div>
      `;
    });

    this.updateLocalClock();
  }

  // Banner Inteligente de Recomendación según el clima del día
  renderSmartBanner() {
    const bannerContainer = document.getElementById('smart-weather-banner');
    if (!bannerContainer || !this.weatherData) return;

    const temp = Math.round(this.weatherData.temperature_2m);
    const cond = this.getWeatherCondition(this.weatherData.weather_code, this.weatherData.is_day);
    const isRaining = cond.isRain || this.weatherData.rain > 0.1 || [3, 45, 48].includes(this.weatherData.weather_code);

    let messageHtml = '';
    if (isRaining) {
      messageHtml = `
        <div class="smart-banner-inner rainy">
          <div class="smart-banner-icon">🌧️</div>
          <div class="smart-banner-text">
            <strong>${cond.label} en Puerto Varas (${temp}°C)</strong>
            <span>El clima pide refugio sureño. Te recomendamos cafeterías con chimenea a leña o tinajas y piscinas climatizadas.</span>
          </div>
          <button type="button" class="btn-smart-filter" onclick="window.weatherService.handleBannerClick('lluvia')">
            Ver recomendados para hoy
          </button>
        </div>
      `;
    } else {
      messageHtml = `
        <div class="smart-banner-inner sunny">
          <div class="smart-banner-icon">☀️</div>
          <div class="smart-banner-text">
            <strong>${cond.label} en Puerto Varas (${temp}°C)</strong>
            <span>¡Excelente día para estar al aire libre! Momento perfecto para el Mirador Philippi, Saltos del Petrohué o muelle frente al lago.</span>
          </div>
          <button type="button" class="btn-smart-filter" onclick="window.weatherService.handleBannerClick('despejado')">
            Ver paseos despejados
          </button>
        </div>
      `;
    }

    bannerContainer.innerHTML = messageHtml;
    bannerContainer.style.display = 'block';
  }

  handleBannerClick(mood) {
    if (typeof window.filterByMood === 'function') {
      window.filterByMood(mood);
    } else if (typeof window.renderReelsGallery === 'function') {
      const targetFilter = mood === 'lluvia' ? 'lluvia' : 'all';
      const reelBtn = document.querySelector(`.reels-filter-btn[data-filter="${targetFilter}"]`);
      if (reelBtn) reelBtn.click();
      const reelSec = document.getElementById('reels-showcase');
      if (reelSec) reelSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = 'index.html#explorar';
    }
  }
}

// Iniciar globalmente
document.addEventListener('DOMContentLoaded', () => {
  window.weatherService = new WeatherService();
});
