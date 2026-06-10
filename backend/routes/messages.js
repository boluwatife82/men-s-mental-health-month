/* ============================================================
   routes/messages.js
   GET  /api/messages/random?burden=fin  — one random message
   GET  /api/messages/all                — all for Silent Room
   POST /api/messages                    — leave a message
   POST /api/messages/:id/heart          — heart a message
============================================================ */
const router  = require('express').Router();
const Message = require('../models/Message');
const crypto  = require('crypto');
const { submitLimit, heartLimit } = require('../middleware/rateLimit');

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'mmh_salt_2024').digest('hex');
}

/* GET one random message by burden */
router.get('/random', (req, res) => {
  try {
    const { burden = 'financial', exclude } = req.query;
    const msg = Message.getRandom(burden, exclude ? parseInt(exclude) : null);
    if (!msg) return res.status(404).json({ ok: false, error: 'No message found.' });
    res.json({ ok: true, data: msg });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET all messages for Silent Room */
router.get('/all', (req, res) => {
  try {
    const { limit = 60 } = req.query;
    const messages = Message.getAll(parseInt(limit));
    res.json({ ok: true, data: messages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* POST leave a message */
router.post('/', submitLimit, (req, res) => {
  try {
    const { content, burden } = req.body;

    if (!content || content.trim().length < 3)
      return res.status(400).json({ ok: false, error: 'Message is too short.' });

    if (content.length > 300)
      return res.status(400).json({ ok: false, error: 'Message is too long.' });

    const result = Message.create({ content, burden });
    res.status(201).json({
      ok: true,
      id: result.id,
      message: 'Your words will reach another man.'
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

/* POST heart a message */
router.post('/:id/heart', heartLimit, (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const ipHash    = hashIP(req.ip);
    const result    = Message.addHeart(messageId, ipHash);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;