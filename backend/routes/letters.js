/* ============================================================
   routes/letters.js
   GET  /api/letters?burden=financial       — all letters
   GET  /api/letters/random?burden=financial — one random
   POST /api/letters                         — submit a letter
   POST /api/letters/:id/heart               — heart a letter
============================================================ */
const router = require('express').Router();
const Letter = require('../models/Letter');
const crypto = require('crypto');
const { submitLimit, heartLimit } = require('../middleware/rateLimit');

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'mmh_salt_2024').digest('hex');
}

/* GET all letters for a burden */
router.get('/', async (req, res) => {
  try {
    const { burden = 'financial' } = req.query;
    const letters = await Letter.getByBurden(burden);
    res.json({ ok: true, data: letters });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET one random letter */
router.get('/random', async (req, res) => {
  try {
    const { burden = 'financial', exclude } = req.query;
    const letter = await Letter.getRandom(burden, exclude ? parseInt(exclude) : null);
    if (!letter) return res.status(404).json({ ok: false, error: 'No letter found.' });
    res.json({ ok: true, data: letter });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* POST heart a letter */
router.post('/:id/heart', heartLimit, async (req, res) => {
  try {
    const letterId = parseInt(req.params.id);
    const ipHash   = hashIP(req.ip);
    const result   = await Letter.addHeart(letterId, ipHash);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* POST submit a community letter */
router.post('/', submitLimit, async (req, res) => {
  try {
    const { title, body, from_line = 'Anonymous', burden } = req.body;

    if (!title || title.trim().length < 5)
      return res.status(400).json({ ok: false, error: 'Title is too short.' });

    if (!body || body.trim().length < 50)
      return res.status(400).json({ ok: false, error: 'Letter is too short.' });

    const paragraphs = body.split('\n').map(p => p.trim()).filter(Boolean);
    const result = await Letter.create({ title, body: paragraphs, from_line, burden });

    res.status(201).json({
      ok: true,
      id: result.id,
      message: 'Your letter has been received. It will find its way to another man who needs it.'
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;