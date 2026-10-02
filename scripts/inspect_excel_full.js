const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('Top 100 Locales Filtrados y Recientes - Datitos de la Jose (Fase 1).xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log('Total rows in Excel:', rows.length);
if (rows.length > 0) {
  console.log('Columns:', Object.keys(rows[0]));
  console.log('Sample row 0:', JSON.stringify(rows[0], null, 2));
}
