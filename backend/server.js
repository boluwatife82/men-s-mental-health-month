/* ============================================================
   server.js — Express entry point
   Men's Mental Health Experience API
============================================================ */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

/* ---- Middleware ---- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ---- Serve frontend static files ---- */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ---- API Routes ---- */
app.use('/api/stories',     require('./routes/stories'));
app.use('/api/letters',     require('./routes/letters'));
app.use('/api/messages',    require('./routes/messages'));
app.use('/api/submissions', require('./routes/submissions'));

/* ---- Health check ---- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running.' });
});

/* ---- Catch-all: serve frontend for any non-API route ---- */
// RIGHT — Express 5 syntax
app.get('/{*path}', (req, res) =>{
  res.sendFile(path.join(__dirname, '../frontend/scetion1.html'));
});

/* ---- Global error handler ---- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, error: 'Something went wrong.' });
});

/* ---- Start ---- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from ../public`);
  console.log(`🗄  Database: ${process.env.DB_PATH || './data/weightwecarry.db'}\n`);
});