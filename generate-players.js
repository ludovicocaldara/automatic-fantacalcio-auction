const fs = require('fs');
const path = require('path');

// Function to parse CSV to array of objects
function parseCSV(csvContent, role) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length >= 5) { // Ensure enough columns
      const obj = {
        Nome: values[headers.indexOf('Nome')],
        squadra: values[headers.indexOf('Squadra')],
        Qt: {
          A: parseInt(values[headers.indexOf('Qt.A')] || 0)
        }
      };
      data.push(obj);
    }
  }
  return data;
}

// Read CSV files
const csvPath = './';
const portieri = fs.readFileSync(path.join(csvPath, 'portieri.csv'), 'utf8');
const difensori = fs.readFileSync(path.join(csvPath, 'difensori.csv'), 'utf8');
const centrocampisti = fs.readFileSync(path.join(csvPath, 'centrocampisti.csv'), 'utf8');
const attaccanti = fs.readFileSync(path.join(csvPath, 'attaccanti.csv'), 'utf8');

// Parse data
const gkRaw = parseCSV(portieri, 'gk');
const defRaw = parseCSV(difensori, 'def');
const cenRaw = parseCSV(centrocampisti, 'cen');
const attRaw = parseCSV(attaccanti, 'att');

// Group gk by squadra
const gkData = {};
gkRaw.forEach(player => {
  const team = player.squadra;
  if (!gkData[team]) {
    gkData[team] = [];
  }
  gkData[team].push(player);
});

// For others, flat arrays
const playersData = {
  gk: gkData,
  def: defRaw,
  cen: cenRaw,
  att: attRaw
};

// Write to frontend/src/players.json
const outputPath = path.join('frontend/src', 'players.json');
fs.writeFileSync(outputPath, JSON.stringify(playersData, null, 2), 'utf8');

console.log('players.json generated successfully at frontend/src/players.json');
