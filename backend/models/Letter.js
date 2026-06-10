/* ============================================================
   Letter.js — data access for letters table
============================================================ */
const db = require('../config/db');

const Letter = {

  /* Get all approved letters for a burden */
  getByBurden(burden) {
    const rows = db.prepare(`
      SELECT id, title, body, from_line, burden, source, hearts, created_at
      FROM   letters
      WHERE  burden = ? AND approved = 1
      ORDER  BY hearts DESC
    `).all(burden);

    /* Parse body from JSON string back to array */
    return rows.map(r => ({ ...r, body: JSON.parse(r.body) }));
  },

  /* Get one random letter for a burden, optionally excluding one id */
  getRandom(burden, excludeId = null) {
    const query = excludeId
      ? `SELECT id, title, body, from_line, burden, source, hearts
         FROM letters WHERE burden = ? AND approved = 1 AND id != ?
         ORDER BY RANDOM() LIMIT 1`
      : `SELECT id, title, body, from_line, burden, source, hearts
         FROM letters WHERE burden = ? AND approved = 1
         ORDER BY RANDOM() LIMIT 1`;

    const params = excludeId ? [burden, excludeId] : [burden];
    const row    = db.prepare(query).get(...params);
    if (!row) return null;
    return { ...row, body: JSON.parse(row.body) };
  },

  /* Add a heart — returns false if already hearted by this IP */
  addHeart(letterId, ipHash) {
    try {
      db.prepare(`
        INSERT INTO letter_hearts (letter_id, ip_hash) VALUES (?, ?)
      `).run(letterId, ipHash);
      const updated = db.prepare(`
        UPDATE letters SET hearts = hearts + 1 WHERE id = ?
      `).run(letterId);
      const row = db.prepare(`SELECT hearts FROM letters WHERE id = ?`).get(letterId);
      return { ok: true, hearts: row.hearts };
    } catch {
      /* PRIMARY KEY violation = already hearted */
      return { ok: false, reason: 'already_hearted' };
    }
  },

  /* Create a new community letter (unapproved) */
  create({ title, body, from_line = 'Anonymous', burden }) {
    const stmt = db.prepare(`
      INSERT INTO letters (title, body, from_line, burden, source, approved)
      VALUES (?, ?, ?, ?, 'community', 0)
    `);
    const result = stmt.run(
      title.trim(),
      JSON.stringify(body),
      from_line.trim(),
      burden
    );
    return { id: result.lastInsertRowid };
  },

};

module.exports = Letter;