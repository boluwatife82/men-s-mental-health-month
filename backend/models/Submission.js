/* ============================================================
   Submission.js — "If Men Were Honest" entries (Section 5)
   Stored separately from stories — can be promoted later
============================================================ */
const db = require('../config/db');

const Submission = {

  /* Save a new honest submission */
  create({ content, burden }) {
    const result = db.prepare(`
      INSERT INTO submissions (content, burden)
      VALUES (?, ?)
    `).run(content.trim(), burden);
    return { id: result.lastInsertRowid };
  },

  /* Get recent submissions for a burden (for live feed) */
  getRecent(burden, limit = 5) {
    return db.prepare(`
      SELECT id, content, burden, created_at
      FROM   submissions
      WHERE  burden = ?
      ORDER  BY created_at DESC
      LIMIT  ?
    `).all(burden, limit);
  },

  /* Get total submission count */
  count() {
    return db.prepare(`SELECT COUNT(*) as total FROM submissions`).get().total;
  },

};

module.exports = Submission;