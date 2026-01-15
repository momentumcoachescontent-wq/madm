const XLSX = require('xlsx');
const fs = require('fs');

// Leer el archivo Excel
const workbook = XLSX.readFile('/home/user/uploaded_files/Blog_Post_G1.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir a JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total de posts encontrados:', data.length);
console.log('\nPrimeros 3 posts de ejemplo:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// Guardar en archivo JSON
fs.writeFileSync(
  '/home/user/webapp/blog-posts.json',
  JSON.stringify(data, null, 2)
);

console.log('\n✅ Archivo guardado en: /home/user/webapp/blog-posts.json');
