const fs = require('fs');

const appJs = fs.readFileSync('js/app.js', 'utf8');
const rbJs = fs.readFileSync('js/route-builder.js', 'utf8');
const rsJs = fs.readFileSync('js/reels-showcase.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const promosHtml = fs.readFileSync('promos.html', 'utf8');

console.log('--- 1. Verificación de doble "+" ---');
const files = [
  { name: 'js/app.js', content: appJs },
  { name: 'js/route-builder.js', content: rbJs },
  { name: 'js/reels-showcase.js', content: rsJs },
  { name: 'index.html', content: indexHtml },
  { name: 'promos.html', content: promosHtml }
];

files.forEach(f => {
  const hasDouble = f.content.includes('+ +');
  console.log(`  ${f.name}: tiene "+ +" -> ${hasDouble ? '❌ SÍ (ERROR)' : '✅ NO (CORRECTO)'}`);
});

console.log('\n--- 2. Verificación de modal postDetailModal ---');
console.log(`  index.html tiene #postDetailModal: ${indexHtml.includes('id="postDetailModal"') ? '✅ SÍ' : '❌ NO'}`);
console.log(`  promos.html tiene #postDetailModal: ${promosHtml.includes('id="postDetailModal"') ? '✅ SÍ' : '❌ NO'}`);

console.log('\n--- 3. Verificación de reproductor de video nativo inline ---');
const placesText = fs.readFileSync('js/places-data.js', 'utf8');
const promosText = fs.readFileSync('js/promos-data.js', 'utf8');
const reelsText = fs.readFileSync('js/reels-data.js', 'utf8');
console.log(`  places-data.js contiene videoUrl: ${placesText.includes('"videoUrl"') ? '✅ SÍ' : '❌ NO'}`);
console.log(`  promos-data.js contiene videoUrl: ${promosText.includes('"videoUrl"') ? '✅ SÍ' : '❌ NO'}`);
console.log(`  reels-data.js contiene videoUrl: ${reelsText.includes('"videoUrl"') ? '✅ SÍ' : '❌ NO'}`);
console.log(`  app.js define openPostDetailModal: ${appJs.includes('openPostDetailModal') ? '✅ SÍ' : '❌ NO'}`);
console.log(`  reels-showcase.js tiene video tag: ${rsJs.includes('<video') ? '✅ SÍ' : '❌ NO'}`);
