const fs = require('fs');

const files = ['index.html', 'promos.html', 'empresa.html', 'quien-soy.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove the top-promo-banner div
  content = content.replace(/<div class="top-promo-banner"[\s\S]*?<\/div>/g, '');
  // Remove the script block that sets its display to block
  content = content.replace(/<script>\s*\/\/ Mostrar banner aleatoriamente[\s\S]*?<\/script>/g, '');
  fs.writeFileSync(file, content);
});

console.log('Removed top promo banner from all files.');
