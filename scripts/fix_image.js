const fs = require('fs');
let c = fs.readFileSync('quien-soy.html', 'utf8');
c = c.replace(/src="img\/datitos-profile\.jpg"/g, 'src="thumbs/logo_insta.jpg"');
fs.writeFileSync('quien-soy.html', c);
console.log('Done');
