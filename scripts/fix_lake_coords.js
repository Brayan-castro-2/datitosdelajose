const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'places-data.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. POI-037 Playa Hermosa
code = code.replace(
  /("id":\s*"POI-037"[\s\S]*?"coordinates":\s*\{[\s\S]*?"lat":\s*)-41\.282(,\s*"lng":\s*)-72\.885/,
  '$1-41.3086$2-72.8859'
);
code = code.replace(
  /dropoff\[latitude\]=-41\.282&dropoff\[longitude\]=-72\.885/g,
  'dropoff[latitude]=-41.3086&dropoff[longitude]=-72.8859'
);

// 2. POI-058 La Jardinera Restaurante
code = code.replace(
  /("id":\s*"POI-058"[\s\S]*?"coordinates":\s*\{[\s\S]*?"lat":\s*)-41\.2856(,\s*"lng":\s*)-72\.9142/,
  '$1-41.3139$2-72.8952'
);
code = code.replace(
  /dropoff\[latitude\]=-41\.2856&dropoff\[longitude\]=-72\.9142/g,
  'dropoff[latitude]=-41.3139&dropoff[longitude]=-72.8952'
);

// 3. POI-014 Fundo Playa Venado
code = code.replace(
  /("id":\s*"POI-014"[\s\S]*?"coordinates":\s*\{[\s\S]*?"lat":\s*)-41\.2885(,\s*"lng":\s*)-72\.822/,
  '$1-41.2705$2-72.8218'
);
code = code.replace(
  /dropoff\[latitude\]=-41\.2885&dropoff\[longitude\]=-72\.822/g,
  'dropoff[latitude]=-41.2705&dropoff[longitude]=-72.8218'
);

// 4. POI-064 Cabañas Bahía Celeste
code = code.replace(
  /("id":\s*"POI-064"[\s\S]*?"coordinates":\s*\{[\s\S]*?"lat":\s*)-41\.2835(,\s*"lng":\s*)-72\.767/,
  '$1-41.2471$2-72.7690'
);
code = code.replace(
  /dropoff\[latitude\]=-41\.2835&dropoff\[longitude\]=-72\.767/g,
  'dropoff[latitude]=-41.2471&dropoff[longitude]=-72.7690'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated coordinates in js/places-data.js');
