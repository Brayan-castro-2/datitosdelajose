const fs = require('fs');
const path = require('path');

// 1. UPDATE CSS FOR LEFT HAMBURGER BUTTON
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace mobile header layout rules in style.css
const oldMobileHeaderRule = `/* Flex Ordering para Header Móvil Limpio y Organizado */
@media (max-width: 900px) {
  .site-header {
    padding: 0.5rem 0 !important;
  }
  .header-container {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.5rem 1rem !important;
    gap: 0.5rem !important;
  }
  .brand-wrapper {
    order: 1 !important;
    flex: 0 1 auto !important;
  }
  .header-weather-widget-slot {
    order: 2 !important;
    margin-left: auto !important;
  }
  #btn-header-route, .btn-route-toggle {
    order: 3 !important;
    flex-shrink: 0 !important;
  }
  .search-bar-wrapper {
    order: 4 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0.2rem 0 !important;
  }
  .nav-links-wrapper {
    order: 5 !important;
    width: 100% !important;
    display: flex !important;
    overflow-x: auto !important;
    padding: 0.2rem 0 !important;
  }
}`;

const newMobileHeaderRule = `/* Header Móvil Limpio con Hamburguesa a la Izquierda */
@media (max-width: 900px) {
  .site-header {
    padding: 0.4rem 0 !important;
  }
  .header-container {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.4rem 0.85rem !important;
    gap: 0.4rem !important;
  }
  .btn-side-menu-toggle {
    order: 1 !important;
    display: inline-flex !important;
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    background: #f4f2ee !important;
    border: 1px solid #e2ded7 !important;
    color: #191c1f !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
  }
  .brand-wrapper {
    order: 2 !important;
    flex: 1 1 auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.45rem !important;
    margin-left: 0.2rem !important;
  }
  .header-weather-widget-slot {
    display: none !important;
  }
  #btn-header-route, .btn-route-toggle {
    order: 3 !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
  }
  .search-bar-wrapper {
    order: 4 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0.25rem 0 0.05rem 0 !important;
  }
  .nav-links-wrapper {
    display: none !important;
  }
}`;

if (css.includes('/* Flex Ordering para Header Móvil Limpio y Organizado */')) {
  css = css.replace(oldMobileHeaderRule, newMobileHeaderRule);
} else {
  css += '\n' + newMobileHeaderRule + '\n';
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated style.css header order');
