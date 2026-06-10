/* ============================================================
   routes/submissions.js
   POST /api/submissions   — "If Men Were Honest" (Section 5)
   GET  /api/submissions/recent?burden=fin — live feed
   GET  /api/stats         — total count for homepage stats
============================================================ */
const router     = require('express').Router();
const Submission = require('../models/Submission');
const { submitLimit } = require('../middleware/rateLimit');

/* POST an honest submission */
router.post('/', submitLimit, (req, res) => {
  try {
    const { content, burden } = req.body;

    if (!content || content.trim().length < 5)
      return res.status(400).json({ ok: false, error: 'Too short.' });

    if (content.length > 500)
      return res.status(400).json({ ok: false, error: 'Too long.' });

    const result = Submission.create({ content, burden });
    res.status(201).json({
      ok: true,
      id: result.id,
      message: 'Your truth has been heard. It will reach another man carrying the same burden.'
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

/* GET recent submissions for live feed in Section 3 */
router.get('/recent', (req, res) => {
  try {
    const { burden = 'financial', limit = 5 } = req.query;
    const data = Submission.getRecent(burden, parseInt(limit));
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* GET total submission count (for stats) */
router.get('/stats', (req, res) => {
  try {
    const total = Submission.count();
    res.json({ ok: true, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;