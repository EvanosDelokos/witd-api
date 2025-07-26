const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const app = express();
const port = process.env.PORT || 3000;

const zonesPath = '/app/Data/zones.json';
const dbPath = '/app/Data/addresses.sqlite';

let db = null;

if (fs.existsSync(dbPath)) {
  db = new sqlite3.Database(dbPath, err => {
    if (err) console.error('Failed to open SQLite DB:', err.message);
    else console.log('SQLite DB connected');
  });
} else {
  console.warn('SQLite DB not found — search endpoint will be disabled.');
}

app.get('/zones', (req, res) => {
  fs.readFile(zonesPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('zones.json not found');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.get('/search', (req, res) => {
  if (!db) return res.status(500).send('Database not connected');
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).send('lat and lng are required');
  db.get("SELECT * FROM locality LIMIT 1", [], (err, row) => {
    if (err) return res.status(500).send('Query failed');
    res.json(row || {});
  });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
