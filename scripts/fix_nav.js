const fs = require('fs');
const files = ['index.html', 'promos.html', 'empresa.html', 'quien-soy.html'];

const nav = `      <nav class="nav-links-wrapper">
        <a href="index.html#mapa-section" class="nav-link-pill">
          <span>Mapa</span>
        </a>
        <a href="quien-soy.html" class="nav-link-pill">
          <span>Quién Soy</span>
        </a>
        <a href="empresa.html" class="nav-link-pill">
          <span>Empresa</span>
        </a>
        <a href="promos.html" class="nav-link-pill" style="color: #E60023; font-weight: 700;">
          <span>🎁 Sorteos & Promos</span>
        </a>
      </nav>`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<nav class="nav-links-wrapper">[\s\S]*?<\/nav>/, nav);
  fs.writeFileSync(file, content);
});
console.log('Nav fixed in all files.');
