const fs = require('fs');
const path = require('path');

console.log('--- Limpiando emojis y dejando el diseño 100% profesional ---');

// 1. LIMPIAR js/route-builder.js
console.log('1. Modificando js/route-builder.js...');
const routeBuilderPath = path.join(__dirname, '..', 'js', 'route-builder.js');
let routeJs = fs.readFileSync(routeBuilderPath, 'utf8');

// A. Reemplazar icono de showToast por SVG profesional
const oldToastMarkup = `<div class="toast-icon">\${type === 'success' ? '✨' : 'ℹ️'}</div>`;
const newToastMarkup = `<div class="toast-icon" style="display:flex;align-items:center;">\${type === 'success' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'}</div>`;

if (routeJs.includes(oldToastMarkup)) {
  routeJs = routeJs.replace(oldToastMarkup, newToastMarkup);
}

// B. Limpiar mensajes de showToast
routeJs = routeJs.replace(/this\.showToast\(`📌 Agregado a "(.*?)"/g, 'this.showToast(`Agregado a "$1"');
routeJs = routeJs.replace(/this\.showToast\(`✨ Nueva lista creada:/g, 'this.showToast(`Nueva lista creada:');
routeJs = routeJs.replace(/this\.showToast\(`✨ Cargada:/g, 'this.showToast(`Ruta cargada:');
routeJs = routeJs.replace(/this\.showToast\('📥 Calendario \.ics descargado con éxito'\);/g, "this.showToast('Itinerario descargado (.ics)');");
routeJs = routeJs.replace(/✨ 10 Rutas Sugeridas por Jose/g, '10 Rutas Sugeridas por Jose');
routeJs = routeJs.replace(/🚀 Cargar Ruta/g, 'Cargar Ruta');
routeJs = routeJs.replace(/📸 Reel/g, 'Reel');

fs.writeFileSync(routeBuilderPath, routeJs, 'utf8');
console.log('✅ js/route-builder.js limpiado');

// 2. LIMPIAR index.html
console.log('2. Modificando index.html...');
const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace('<span>✨ Todos (100)</span>', '<span>Todos (100)</span>');
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ index.html limpiado');

// 3. LIMPIAR promos.html
console.log('3. Modificando promos.html...');
const promosPath = path.join(__dirname, '..', 'promos.html');
let promosHtml = fs.readFileSync(promosPath, 'utf8');
promosHtml = promosHtml.replace('<span>✨ Todas las Promos (12)</span>', '<span>Todas las Promos (12)</span>');
fs.writeFileSync(promosPath, promosHtml, 'utf8');
console.log('✅ promos.html limpiado');

// 4. LIMPIAR quien-soy.html
console.log('4. Modificando quien-soy.html...');
const quienSoyPath = path.join(__dirname, '..', 'quien-soy.html');
let quienSoyHtml = fs.readFileSync(quienSoyPath, 'utf8');
quienSoyHtml = quienSoyHtml.replace('<span>📌 Guardar en mi Lista / Itinerario de Viaje</span>', '<span>Guardar en mi Lista / Itinerario de Viaje</span>');
quienSoyHtml = quienSoyHtml.replace('<div class="empty-icon">📌</div>', '<div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>');
fs.writeFileSync(quienSoyPath, quienSoyHtml, 'utf8');
console.log('✅ quien-soy.html limpiado');

console.log('--- ¡Todos los emotes artificiales han sido eliminados con éxito! ---');
