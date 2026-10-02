const fs = require('fs');

['index.html', 'promos.html', 'quien-soy.html', 'empresa.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log('=== ' + f + ' ===');
  console.log('Hamburger header button:', content.includes('id="btn-side-menu-toggle"'));
  console.log('Bottom Nav "Jose" (slot 4):', content.includes('id="s-nav-jose"'));
  console.log('Bottom Nav "Sorteos" (should be false):', content.includes('id="s-nav-promos"'));
  console.log('Drawer has Sorteos link:', content.includes('href="promos.html"'));
  console.log('Drawer has Empresa link:', content.includes('href="empresa.html"'));
});
