require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ---- API Routes ---- */
app.use('/api/stories',     require('./routes/stories'));
app.use('/api/letters',     require('./routes/letters'));
app.use('/api/messages',    require('./routes/messages'));
app.use('/api/submissions', require('./routes/submissions'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running.' });
});

/* ---- Serve frontend ---- */
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/scetion1.html'));
});

/* ---- Error handler ---- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, error: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});