const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Google Font Import
css = css.replace(
  /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit[^\)]+'\);/,
  "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..800;1,9..40,400..800&family=Inter:wght@300;400;500;600;700&display=swap');"
);

// 2. Root variables
css = css.replace(/--radius-card:\s*22px;/, '--radius-card: 10px;');
css = css.replace(/--radius-pill:\s*9999px;/, '--radius-pill: 8px;');
css = css.replace(/--radius-badge:\s*12px;/, '--radius-badge: 6px;');
css = css.replace(/--radius-small:\s*8px;/, '--radius-small: 4px;');
css = css.replace(/--font-display:\s*'Plus Jakarta Sans'[^;]+;/, "--font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");
css = css.replace(/--font-body:\s*'Outfit'[^;]+;/, "--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");

// 3. Specific large radius replacements
const rules = [
  { match: /\.hero-carousel-container\s*\{[^}]*border-radius:\s*28px;/g, replace: s => s.replace('28px', '12px') },
  { match: /\.hero-carousel-container\s*\{[^}]*border-radius:\s*20px;/g, replace: s => s.replace('20px', '12px') },
  { match: /\.map-sticky-wrapper\s*\{[^}]*border-radius:\s*28px;/g, replace: s => s.replace('28px', '12px') },
  { match: /\.editorial-portrait-frame\s*\{[^}]*border-radius:\s*32px;/g, replace: s => s.replace('32px', '12px') },
  { match: /\.editorial-portrait-badge\s*\{[^}]*border-radius:\s*20px;/g, replace: s => s.replace('20px', '8px') },
  { match: /\.wall-pin-item\s*\{[^}]*border-radius:\s*20px;/g, replace: s => s.replace('20px', '8px') },
  { match: /\.b2b-service-card\s*\{[^}]*border-radius:\s*26px;/g, replace: s => s.replace('26px', '10px') },
  { match: /\.service-icon-box\s*\{[^}]*border-radius:\s*18px;/g, replace: s => s.replace('18px', '8px') },
  { match: /\.b2b-form-card\s*\{[^}]*border-radius:\s*32px;/g, replace: s => s.replace('32px', '12px') },
  { match: /\.insta-business-card\s*\{[^}]*border-radius:\s*28px;/g, replace: s => s.replace('28px', '12px') },
  { match: /\.insta-verified-promise-banner\s*\{[^}]*border-radius:\s*18px;/g, replace: s => s.replace('18px', '8px') },
  { match: /\.reel-modal-container\s*\{[^}]*border-radius:\s*28px;/g, replace: s => s.replace('28px', '12px') },
  { match: /\.save-board-card\s*\{[^}]*border-radius:\s*24px;/g, replace: s => s.replace('24px', '10px') },
  { match: /\.smart-banner-inner\s*\{[^}]*border-radius:\s*18px;/g, replace: s => s.replace('18px', '10px') },
  { match: /\.search-quick-tag\s*\{[^}]*border-radius:\s*20px;/g, replace: s => s.replace('20px', '6px') },
  { match: /\.map-floating-route-summary\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.btn-fit-route\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.mood-pill-btn\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.mobile-map-view-toggle\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.pricing-card\s*\{[^}]*border-radius:\s*22px;/g, replace: s => s.replace('22px', '10px') },
  { match: /\.pricing-popular-ribbon\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '6px') },
  { match: /\.btn-pricing-cta\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.promos-partner-cta-banner\s*\{[^}]*border-radius:\s*22px;/g, replace: s => s.replace('22px', '12px') },
  { match: /\.partner-cta-badge\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '6px') },
  { match: /\.btn-partner-whatsapp\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.btn-partner-planes\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.official-collab-container\s*\{[^}]*border-radius:\s*22px;/g, replace: s => s.replace('22px', '12px') },
  { match: /\.official-collab-badge\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '6px') },
  { match: /\.btn-collab-cta\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.btn-collab-wa\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /\.side-social-btn\s*\{[^}]*border-radius:\s*9999px;/g, replace: s => s.replace('9999px', '8px') },
  { match: /leaflet-popup-content-wrapper\s*\{[^}]*border-radius:\s*18px\s*!important;/g, replace: s => s.replace('18px', '10px') }
];

rules.forEach(r => {
  css = css.replace(r.match, r.replace);
});

// Also replace any remaining 9999px inside buttons and pills
css = css.replace(/border-radius:\s*9999px;/g, 'border-radius: 8px;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated style.css with human typography and subtle border radii!');
