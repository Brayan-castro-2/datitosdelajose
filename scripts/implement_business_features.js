const fs = require('fs');
const path = require('path');

const PHONE = '56979430387';
const DISPLAY_PHONE = '+56 9 7943 0387';

console.log('--- Implementando mejoras comerciales y contacto WhatsApp ---');

// 1. ACTUALIZAR empresa.html
console.log('1. Actualizando empresa.html con tabla de planes y WhatsApp real...');
let empresaHtml = fs.readFileSync(path.join(__dirname, '..', 'empresa.html'), 'utf8');

// Reemplazar teléfonos ficticios
empresaHtml = empresaHtml.replace(/56987654321/g, PHONE);

// Insertar la Sección de Tarifario y Planes Comerciales antes del Formulario
const pricingPlansSection = `
  <!-- ========================================================================
       TABLA DE PLANES & TARIFAS COMERCIALES PARA COLABORADORES
       ======================================================================== -->
  <section class="b2b-pricing-section" id="planes">
    <div class="pricing-header-box">
      <span class="b2b-badge">Planes Comerciales 2026</span>
      <h2 class="pricing-main-title">Elige cómo destacar en Datitos de la Jose</h2>
      <p class="pricing-main-subtitle">
        Conecta tu cabaña, restaurante, hotel o experiencia turística con una comunidad real de más de 35.700 turistas que planifican su estadía en la cuenca del Lago Llanquihue.
      </p>
    </div>

    <div class="b2b-pricing-grid">
      <!-- Plan 1: Ficha Web Colaboradora -->
      <div class="pricing-card">
        <div class="pricing-badge-tier">Presencia Digital</div>
        <h3 class="pricing-tier-name">Ficha Colaboradora Web</h3>
        <div class="pricing-price-wrap">
          <span class="pricing-currency">$</span>
          <span class="pricing-amount">35.000</span>
          <span class="pricing-period">CLP / mes</span>
        </div>
        <p class="pricing-desc">Ideal para negocios con local físico o cabañas que buscan reservas directas sin pagar comisiones a OTAs.</p>
        <ul class="pricing-features-list">
          <li>✓ Pin verificado en el mapa interactivo de Puerto Varas</li>
          <li>✓ Botón directo a tu WhatsApp de reservas (0% comisión)</li>
          <li>✓ Botón directo a tu Menú / Carta Digital o Airbnb</li>
          <li>✓ Botón de Uber con coordenadas exactas a tu puerta</li>
          <li>✓ Prioridad en buscador de la plataforma web</li>
        </ul>
        <a href="https://wa.me/${PHONE}?text=Hola%20Mar%C3%ADa%20Jos%C3%A9!%20Me%20interesa%20contratar%20el%20Plan%20Ficha%20Colaboradora%20Web%20($35.000/mes)%20para%20mi%20negocio." target="_blank" rel="noopener" class="btn-pricing-cta btn-pricing-secondary">
          <span>Cotizar Ficha por WhatsApp</span>
        </a>
      </div>

      <!-- Plan 2: Promoción & Beneficio (Destacado) -->
      <div class="pricing-card pricing-card-featured">
        <div class="pricing-popular-ribbon">⭐ Más Recomendado</div>
        <div class="pricing-badge-tier">Tráfico & Ventas</div>
        <h3 class="pricing-tier-name">Plan Promoción & Beneficio</h3>
        <div class="pricing-price-wrap">
          <span class="pricing-currency">$</span>
          <span class="pricing-amount">55.000</span>
          <span class="pricing-period">CLP / mes</span>
        </div>
        <p class="pricing-desc">Para restaurantes, cafeterías y servicios que quieren llenar mesas en días lentos o temporadas bajas.</p>
        <ul class="pricing-features-list">
          <li>✓ <strong>Todo lo incluido en el Plan Ficha Web</strong></li>
          <li>✓ Espacio destacado en la sección oficial de <strong>🎁 Sorteos & Promos</strong></li>
          <li>✓ Difusión de tu beneficio exclusivo (2x1, regalo en consumo o descuento)</li>
          <li>✓ Mención y enlace directo a tu Instagram en historias</li>
          <li>✓ Insignia de Beneficio Activo en tu ficha del mapa</li>
        </ul>
        <a href="https://wa.me/${PHONE}?text=Hola%20Mar%C3%ADa%20Jos%C3%A9!%20Me%20interesa%20el%20Plan%20Promoci%C3%B3n%20%26%20Beneficio%20($55.000/mes)%20para%20publicar%20en%20Datitos%20de%20la%20Jose." target="_blank" rel="noopener" class="btn-pricing-cta btn-pricing-primary">
          <span>Publicar mi Promoción</span>
        </a>
      </div>

      <!-- Plan 3: Experiencia Completa (UGC + Reel + Web) -->
      <div class="pricing-card">
        <div class="pricing-badge-tier">Impacto Masivo</div>
        <h3 class="pricing-tier-name">Experiencia Completa UGC</h3>
        <div class="pricing-price-wrap">
          <span class="pricing-currency">$</span>
          <span class="pricing-amount">290.000</span>
          <span class="pricing-period">CLP (Semestral)</span>
        </div>
        <p class="pricing-desc">El paquete integral: visita en terreno, video viral en Instagram y presencia permanente en rutas.</p>
        <ul class="pricing-features-list">
          <li>✓ <strong>6 meses de Ficha Web Colaboradora y Promoción</strong></li>
          <li>✓ Visita en terreno y vivencia real por María José</li>
          <li>✓ Reel vertical 9:16 en alta definición publicado en @datitosdelajose (+35.7K)</li>
          <li>✓ Inclusión oficial dentro de 1 de las 10 Rutas Recomendadas</li>
          <li>✓ Entrega de material fotográfico y video en bruto para tu uso libre</li>
        </ul>
        <a href="https://wa.me/${PHONE}?text=Hola%20Mar%C3%ADa%20Jos%C3%A9!%20Quiero%20coordinar%20una%20visita%20en%20terreno%20y%20el%20Plan%20Experiencia%20Completa%20UGC%20con%20Reel%20para%20mi%20negocio." target="_blank" rel="noopener" class="btn-pricing-cta btn-pricing-secondary">
          <span>Coordinar Visita & Reel</span>
        </a>
      </div>
    </div>
  </section>
`;

if (!empresaHtml.includes('b2b-pricing-section')) {
  empresaHtml = empresaHtml.replace(
    '<!-- ========================================================================\n       FORMULARIO DE POSTULACIÓN',
    `${pricingPlansSection}\n  <!-- ========================================================================\n       FORMULARIO DE POSTULACIÓN`
  );
}

// Mejorar handleFormSubmit para que arme mensaje dinámico y redirija directamente a WhatsApp
const newFormScript = `
  <script>
    function handleFormSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-apply');
      const bName = document.getElementById('business-name').value.trim();
      const cat = document.getElementById('business-category').value;
      const cName = document.getElementById('contact-name').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const ig = document.getElementById('contact-instagram').value.trim();
      const addr = document.getElementById('business-address').value.trim();
      const special = document.getElementById('business-special').value.trim();

      btn.innerHTML = \`<span>Abriendo WhatsApp de María José...</span>\`;
      btn.disabled = true;

      const msg = [
        \`*Hola María José! Quiero sumar mi negocio a Datitos de la Jose*\`,
        \`\\n📍 *Negocio:* \${bName}\`,
        \`🏷️ *Categoría:* \${cat}\`,
        \`👤 *Contacto:* \${cName} (\${phone})\`,
        \`✉️ *Email:* \${email}\`,
        ig ? \`📸 *Instagram:* \${ig}\` : '',
        \`📌 *Ubicación:* \${addr}\`,
        \`✨ *Experiencia destacada:* \${special}\`,
        \`\\n¿Podemos coordinar una cotización o visita en terreno?\`
      ].filter(Boolean).join('\\n');

      const waUrl = \`https://wa.me/${PHONE}?text=\${encodeURIComponent(msg)}\`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
        btn.innerHTML = \`<span>✓ Propuesta enviada por WhatsApp</span>\`;
        btn.style.background = '#10B981';
        setTimeout(() => {
          document.getElementById('apply-form').reset();
          btn.innerHTML = \`
            <span>Enviar Propuesta a María José</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          \`;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 600);
    }
  </script>
`;

empresaHtml = empresaHtml.replace(/<script>[\s\S]*?function handleFormSubmit[\s\S]*?<\/script>/, newFormScript.trim());
fs.writeFileSync(path.join(__dirname, '..', 'empresa.html'), empresaHtml, 'utf8');
console.log('✅ empresa.html actualizado con tarifario y envío real a WhatsApp');

// 2. ACTUALIZAR promos.html CON BANNER PARA COLABORADORES
console.log('2. Actualizando promos.html con banner para nuevos colaboradores...');
let promosHtml = fs.readFileSync(path.join(__dirname, '..', 'promos.html'), 'utf8');

const partnerBannerHtml = `
    <!-- Banner de Captación para Negocios y Colaboradores -->
    <div class="promos-partner-cta-banner">
      <div class="partner-cta-badge">⭐ Para Restaurantes, Cabañas & Experiencias</div>
      <h3 class="partner-cta-title">¿Tienes un negocio y quieres publicar tu beneficio o 2x1 aquí?</h3>
      <p class="partner-cta-desc">
        Súmate a la red oficial de colaboradores de <strong>@datitosdelajose</strong>. Publica tu descuento, menú o sorteo directo ante miles de turistas que planifican su visita en Puerto Varas y la cuenca del lago.
      </p>
      <div class="partner-cta-btns">
        <a href="https://wa.me/${PHONE}?text=Hola%20Mar%C3%ADa%20Jos%C3%A9!%20Tengo%20un%20negocio%20y%20me%20gustar%C3%ADa%20publicar%20una%20promoci%C3%B3n%20o%20beneficio%20en%20tu%20plataforma." target="_blank" rel="noopener" class="btn-partner-whatsapp">
          💬 Publicar mi beneficio por WhatsApp (${DISPLAY_PHONE})
        </a>
        <a href="empresa.html#planes" class="btn-partner-planes">
          Ver Planes y Tarifas &raquo;
        </a>
      </div>
    </div>
`;

if (!promosHtml.includes('promos-partner-cta-banner')) {
  promosHtml = promosHtml.replace(
    '</section>\n  </main>',
    `</section>\n${partnerBannerHtml}\n  </main>`
  );
  fs.writeFileSync(path.join(__dirname, '..', 'promos.html'), promosHtml, 'utf8');
  console.log('✅ promos.html actualizado con banner de colaboración');
}

// 3. ACTUALIZAR index.html CON BADGE DE RED OFICIAL DE COLABORADORES
console.log('3. Actualizando index.html con banner de red oficial de colaboradores...');
let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const collabBannerHtml = `
  <!-- Banner de Red Oficial de Colaboradores de Datitos de la Jose -->
  <section class="official-collab-section">
    <div class="official-collab-container">
      <div class="official-collab-badge">⭐ Red Oficial de Colaboradores</div>
      <h3 class="official-collab-title">Recomendaciones 100% Auténticas y Comprobadas en Terreno</h3>
      <p class="official-collab-desc">
        Todos los locales de este mapa forman parte de los lugares visitados y recomendados por <strong>María José Ibáñez (@datitosdelajose)</strong>. ¿Tienes una cabaña, restaurante, hotel o panorama en la cuenca del Lago Llanquihue y quieres sumarte a nuestra guía?
      </p>
      <div class="official-collab-actions">
        <a href="empresa.html#planes" class="btn-collab-cta">
          <span>Conoce cómo ser Colaborador Oficial</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
        <a href="https://wa.me/${PHONE}?text=Hola%20Mar%C3%ADa%20Jos%C3%A9!%20Te%20escribo%20desde%20la%20web%20para%20consultar%20sobre%20sumar%20mi%20negocio%20a%20tu%20red%20de%20colaboradores." target="_blank" rel="noopener" class="btn-collab-wa">
          💬 WhatsApp Directo (${DISPLAY_PHONE})
        </a>
      </div>
    </div>
  </section>
`;

if (!indexHtml.includes('official-collab-section')) {
  indexHtml = indexHtml.replace(
    '</main>',
    `</main>\n${collabBannerHtml}`
  );
  fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml, 'utf8');
  console.log('✅ index.html actualizado con banner de colaboradores');
}

// 4. ESTILOS CSS PARA PLANES, BANNERS DE COLABORACIÓN Y BOTONES CON FEEDBACK
console.log('4. Añadiendo estilos CSS para tarifario y banners a css/style.css...');
let css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

const businessCssStyles = `
/* ==========================================================================
   ESTILOS COMERCIALES: TARIFARIO B2B, PLANES Y BANNERS DE COLABORADORES
   ========================================================================== */
.b2b-pricing-section {
  max-width: 1200px;
  margin: 3.5rem auto 2.5rem;
  padding: 0 1.5rem;
}

.pricing-header-box {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 3rem;
}

.pricing-main-title {
  font-family: var(--font-display, sans-serif);
  font-size: 2.2rem;
  font-weight: 800;
  color: #191c1f;
  margin: 0.6rem 0;
  line-height: 1.2;
}

.pricing-main-subtitle {
  color: var(--color-text-secondary, #5a626a);
  font-size: 1.05rem;
  line-height: 1.5;
}

.b2b-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.8rem;
  align-items: stretch;
}

.pricing-card {
  background: #ffffff;
  border: 1.5px solid #edece9;
  border-radius: 22px;
  padding: 2.2rem 1.8rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

.pricing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.08);
}

.pricing-card-featured {
  border-color: #E60023;
  box-shadow: 0 14px 40px rgba(230, 0, 35, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #fffbfb 100%);
  position: relative;
}

.pricing-popular-ribbon {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #E60023;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.3rem 0.9rem;
  border-radius: 9999px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(230, 0, 35, 0.3);
}

.pricing-badge-tier {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #8c959f;
  letter-spacing: 0.8px;
  margin-bottom: 0.4rem;
}

.pricing-tier-name {
  font-family: var(--font-display, sans-serif);
  font-size: 1.45rem;
  font-weight: 800;
  color: #191c1f;
  margin-bottom: 0.75rem;
}

.pricing-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 1rem;
}

.pricing-currency {
  font-size: 1.3rem;
  font-weight: 800;
  color: #E60023;
}

.pricing-amount {
  font-size: 2.6rem;
  font-weight: 800;
  font-family: var(--font-display, sans-serif);
  color: #191c1f;
  line-height: 1;
}

.pricing-period {
  font-size: 0.88rem;
  color: #8c959f;
  font-weight: 600;
}

.pricing-desc {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #5a626a);
  line-height: 1.4;
  margin-bottom: 1.5rem;
  min-height: 48px;
}

.pricing-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

.pricing-features-list li {
  font-size: 0.88rem;
  color: #333;
  line-height: 1.4;
}

.pricing-features-list strong {
  color: #191c1f;
}

.btn-pricing-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.4rem;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-pricing-primary {
  background: #E60023;
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(230, 0, 35, 0.28);
}

.btn-pricing-primary:hover {
  background: #b8001b;
  transform: scale(1.02);
}

.btn-pricing-secondary {
  background: #f4f2ee;
  color: #191c1f;
  border: 1px solid #edece9;
}

.btn-pricing-secondary:hover {
  background: #191c1f;
  color: #ffffff;
}

/* Banner de Captación en promos.html */
.promos-partner-cta-banner {
  max-width: 1440px;
  margin: 2.5rem auto 3.5rem;
  padding: 2.2rem 2.5rem;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%);
  border: 1.5px solid #FFD4D4;
  border-radius: 22px;
  text-align: center;
}

.partner-cta-badge {
  display: inline-block;
  background: #E60023;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.25rem 0.8rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.partner-cta-title {
  font-family: var(--font-display, sans-serif);
  font-size: 1.6rem;
  font-weight: 800;
  color: #191c1f;
  margin-bottom: 0.6rem;
}

.partner-cta-desc {
  max-width: 780px;
  margin: 0 auto 1.5rem;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

.partner-cta-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-partner-whatsapp {
  background: #25D366;
  color: #ffffff;
  padding: 0.85rem 1.6rem;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 0.92rem;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(37, 211, 102, 0.3);
  transition: transform 0.2s ease;
}

.btn-partner-whatsapp:hover {
  transform: scale(1.03);
}

.btn-partner-planes {
  background: #ffffff;
  color: #191c1f;
  border: 1.5px solid #edece9;
  padding: 0.85rem 1.4rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  transition: background 0.2s ease;
}

.btn-partner-planes:hover {
  background: #f4f2ee;
}

/* Banner de Red Oficial en index.html */
.official-collab-section {
  max-width: 1440px;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
}

.official-collab-container {
  background: #ffffff;
  border: 1.5px solid #edece9;
  border-radius: 22px;
  padding: 2.2rem 2.5rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.official-collab-badge {
  display: inline-block;
  background: #faeee9;
  color: #c85a32;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.official-collab-title {
  font-family: var(--font-display, sans-serif);
  font-size: 1.5rem;
  font-weight: 800;
  color: #191c1f;
  margin-bottom: 0.5rem;
}

.official-collab-desc {
  max-width: 780px;
  margin: 0 auto 1.5rem;
  font-size: 0.95rem;
  color: #5a626a;
  line-height: 1.5;
}

.official-collab-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-collab-cta {
  background: #E60023;
  color: #ffffff;
  padding: 0.85rem 1.5rem;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 0.92rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-collab-cta:hover {
  background: #b8001b;
  transform: scale(1.03);
}

.btn-collab-wa {
  background: #f4f2ee;
  color: #191c1f;
  padding: 0.85rem 1.4rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  border: 1px solid #edece9;
  transition: background 0.2s ease;
}

.btn-collab-wa:hover {
  background: #e8e6e1;
}

/* Responsiveness para el tarifario comercial */
@media (max-width: 992px) {
  .b2b-pricing-grid {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }
}
`;

if (!css.includes('b2b-pricing-section')) {
  css += '\n' + businessCssStyles;
  fs.writeFileSync(path.join(__dirname, '..', 'css', 'style.css'), css, 'utf8');
  console.log('✅ Estilos comerciales agregados a css/style.css');
}

console.log('--- Completado exitosamente ---');
