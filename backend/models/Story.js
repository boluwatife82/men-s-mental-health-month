/* ============================================================
   Story.js — data access for stories table
============================================================ */
const db = require('../config/db');

const VALID_BURDENS = [
  'financial','family','loneliness','relationship',
  'career','grief','selfdoubt','lost','fatherhood','other'
];

const Story = {

  /* Get approved stories by burden, newest first, limit 20 */
  getByBurden(burden, limit = 20) {
    return db.prepare(`
      SELECT id, content, burden, country, source, created_at
      FROM   stories
      WHERE  burden = ? AND approved = 1
      ORDER  BY created_at DESC
      LIMIT  ?
    `).all(burden, limit);
  },

  /* Get seeded stories only (source = 'seeded') for initial load */
  getSeeded(burden) {
    return db.prepare(`
      SELECT id, content, burden, country, source, created_at
      FROM   stories
      WHERE  burden = ? AND source = 'seeded' AND approved = 1
      ORDER  BY created_at DESC
    `).all(burden);
  },

  /* Insert a new community story (unapproved by default) */
  create({ content, burden, country = 'Anonymous' }) {
    if (!VALID_BURDENS.includes(burden)) throw new Error('Invalid burden');
    const stmt = db.prepare(`
      INSERT INTO stories (content, burden, country, source, approved)
      VALUES (?, ?, ?, 'community', 0)
    `);
    const result = stmt.run(content.trim(), burden, country.trim());
    return { id: result.lastInsertRowid };
  },

  /* Count total stories per burden (for the live counter) */
  countByBurden(burden) {
    return db.prepare(`
      SELECT COUNT(*) as total FROM stories
      WHERE burden = ? AND approved = 1
    `).get(burden).total;
  },

};

module.exports = Story;