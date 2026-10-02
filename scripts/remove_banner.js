const fs = require('fs');

const files = ['index.html', 'promos.html', 'empresa.html', 'quien-soy.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Use regex to remove the entire header-announcement div
  content = content.replace(/<div class="header-announcement">[\s\S]*?<\/div>/g, '');
  fs.writeFileSync(file, content);
});

console.log('Removed header announcement from all files.');
