/* ============================================================
   routes/stories.js
   GET  /api/stories?burden=financial   — fetch stories
   POST /api/stories                    — submit a story
   GET  /api/stories/count?burden=fin   — live counter
============================================================ */
const router = require('express').Router();
const Story  = require('../models/Story');
const { submitLimit } = require('../middleware/rateLimit');

/* GET stories by burden */
router.get('/', (req, res) => {
  try {
    const { burden = 'financial', limit = 20 } = req.query;
    const stories = Story.getByBurden(burden, parseInt(limit));
    res.json({ ok: true, data: stories });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET live count for a burden */
router.get('/count', (req, res) => {
  try {
    const { burden = 'financial' } = req.query;
    const total = Story.countByBurden(burden);
    res.json({ ok: true, burden, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* POST a new anonymous story */
router.post('/', submitLimit, (req, res) => {
  try {
    const { content, burden, country = 'Anonymous' } = req.body;

    if (!content || content.trim().length < 5)
      return res.status(400).json({ ok: false, error: 'Story is too short.' });

    if (content.length > 500)
      return res.status(400).json({ ok: false, error: 'Story is too long.' });

    const result = Story.create({ content, burden, country });
    res.status(201).json({
      ok: true,
      id: result.id,
      message: 'Your story has been received. Thank you for sharing.'
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;