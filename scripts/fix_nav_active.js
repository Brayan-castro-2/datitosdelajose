const fs = require('fs');
let c = fs.readFileSync('js/route-builder.js', 'utf8');

const append = `
// Auto-highlight active navigation link
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-pill').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const cleanHref = href.split('#')[0]; // Ignore hash
      if (cleanHref === currentPath) {
        link.classList.add('active');
      }
    }
  });
});
`;

if (!c.includes('Auto-highlight active navigation link')) {
  fs.writeFileSync('js/route-builder.js', c + append);
}

console.log('Done appending nav active logic.');
