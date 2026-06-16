/* ============================================================
   routes/submissions.js
   POST /api/submissions   — "If Men Were Honest" (Section 5)
   GET  /api/submissions/recent?burden=fin — live feed
   GET  /api/submissions/stats — total count
============================================================ */
const router     = require('express').Router();
const Submission = require('../models/Submission');
const Story      = require('../models/Story');
const { submitLimit } = require('../middleware/rateLimit');

/* POST an honest submission */
router.post('/', submitLimit, async (req, res) => {
  try {
    const { content, burden } = req.body;

    if (!content || content.trim().length < 5)
      return res.status(400).json({ ok: false, error: 'Too short.' });

    if (content.length > 500)
      return res.status(400).json({ ok: false, error: 'Too long.' });

    /* Save to submissions table (record keeping) */
    const result = await Submission.create({ content, burden });

    /* Also add it directly to stories — shows immediately in Section 3 */
    await Story.create({ content, burden, country: 'Anonymous' });

    res.status(201).json({
      ok: true,
      id: result.id,
      message: 'Your truth has been heard. It will reach another man carrying the same burden.'
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

/* GET recent submissions for live feed */
router.get('/recent', async (req, res) => {
  try {
    const { burden = 'financial', limit = 5 } = req.query;
    const data = await Submission.getRecent(burden, parseInt(limit));
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET total submission count */
router.get('/stats', async (req, res) => {
  try {
    const total = await Submission.count();
    res.json({ ok: true, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;