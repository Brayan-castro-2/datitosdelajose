const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'Base de Datos Web Completa (127 Negocios y Atractivos) - Datitos de la Jose.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet);
  console.log(`\n=== SHEET: ${sheetName} (Rows: ${json.length}) ===`);
  if (json.length > 0) {
    console.log('Columns:', Object.keys(json[0]));
    console.log('Sample Row 1:', JSON.stringify(json[0], null, 2));
    if (json.length > 1) {
      console.log('Sample Row 2:', JSON.stringify(json[1], null, 2));
    }
  }
});
