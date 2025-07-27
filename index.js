const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Correct path to volume-mounted SQLite file
const dbPath = '/data/data/storage/data/data/addresses.sqlite';
const zonesPath = '/data/zones.json';
const localityPath = '/data/data/storage/data/data/LocalityPolygon.geojson'; // 👈 added

let db = null;
console.log('🔍 Checking for SQLite file at:', dbPath);
console.log('📂 Contents of /data/data/storage/data:', fs.readdirSync('/data/data/storage/data'));

if (fs.existsSync(dbPath)) {
  db = new sqlite3.Database(dbPath, err => {
    if (err) console.error('❌ Failed to open SQLite DB:', err.message);
    else console.log('✅ SQLite DB connected');
  });
} else {
  console.warn('⚠️ SQLite DB not found — search endpoint will be disabled.');
}

app.get('/zones', (req, res) => {
  fs.readFile(zonesPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('zones.json not found');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// ✅ New: Serve LocalityPolygon.geojson
app.get('/locality', (req, res) => {
  res.sendFile(localityPath);
});

// ✅ Replace with real query later
app.get('/search', (req, res) => {
  if (!db) return res.status(500).send('Database not connected');
  const { q } = req.query;
  if (!q) return res.status(400).send('Missing query');

  db.all(`
    SELECT * FROM addresses
    WHERE address LIKE ? OR suburb LIKE ?
    LIMIT 10
  `, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) return res.status(500).send('Query failed');
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
});
