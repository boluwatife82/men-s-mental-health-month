/* ============================================================
   Message.js — data access for messages table
   Messages are the short notes left in Section 7
   and received in Section 6
============================================================ */
const db = require('../config/db');

const Message = {

  /* Get one random message for a burden, exclude one id if given */
  getRandom(burden, excludeId = null) {
    const query = excludeId
      ? `SELECT id, content, burden, source, hearts
         FROM messages WHERE burden = ? AND id != ?
         ORDER BY RANDOM() LIMIT 1`
      : `SELECT id, content, burden, source, hearts
         FROM messages WHERE burden = ?
         ORDER BY RANDOM() LIMIT 1`;

    const params = excludeId ? [burden, excludeId] : [burden];
    return db.prepare(query).get(...params) || null;
  },

  /* Get all messages for the Silent Room (Section 8) */
  getAll(limit = 60) {
    return db.prepare(`
      SELECT id, content, burden, source, hearts
      FROM   messages
      ORDER  BY RANDOM()
      LIMIT  ?
    `).all(limit);
  },

  /* Save a new message */
  create({ content, burden }) {
    const result = db.prepare(`
      INSERT INTO messages (content, burden, source)
      VALUES (?, ?, 'community')
    `).run(content.trim(), burden);
    return { id: result.lastInsertRowid };
  },

  /* Heart a message — one per IP */
  addHeart(messageId, ipHash) {
    try {
      db.prepare(`
        INSERT INTO message_hearts (message_id, ip_hash) VALUES (?, ?)
      `).run(messageId, ipHash);
      db.prepare(`
        UPDATE messages SET hearts = hearts + 1 WHERE id = ?
      `).run(messageId);
      const row = db.prepare(`SELECT hearts FROM messages WHERE id = ?`).get(messageId);
      return { ok: true, hearts: row.hearts };
    } catch {
      return { ok: false, reason: 'already_hearted' };
    }
  },

};

module.exports = Message;