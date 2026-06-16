const router = require('express').Router();
const Story  = require('../models/Story');
const { submitLimit } = require('../middleware/rateLimit');

/* GET stories by burden */
router.get('/', async (req, res) => {
  try {
    const { burden = 'financial', limit = 20 } = req.query;
    const stories = await Story.getByBurden(burden, parseInt(limit));
    res.json({ ok: true, data: stories });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET live count for a burden */
router.get('/count', async (req, res) => {
  try {
    const { burden = 'financial' } = req.query;
    const total = await Story.countByBurden(burden);
    res.json({ ok: true, burden, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* POST a new anonymous story */
router.post('/', submitLimit, async (req, res) => {
  try {
    const { content, burden, country = 'Anonymous' } = req.body;

    if (!content || content.trim().length < 5)
      return res.status(400).json({ ok: false, error: 'Story is too short.' });

    if (content.length > 500)
      return res.status(400).json({ ok: false, error: 'Story is too long.' });

    const result = await Story.create({ content, burden, country });
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