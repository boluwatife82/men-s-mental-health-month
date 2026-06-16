/* ============================================================
   Message.js — PostgreSQL
============================================================ */
const pool = require('../config/db');

const Message = {

  async getRandom(burden, excludeId = null) {
    const query = excludeId
      ? `SELECT id, content, burden, source, hearts
         FROM messages WHERE burden = $1 AND id != $2
         ORDER BY RANDOM() LIMIT 1`
      : `SELECT id, content, burden, source, hearts
         FROM messages WHERE burden = $1
         ORDER BY RANDOM() LIMIT 1`;

    const params = excludeId ? [burden, excludeId] : [burden];
    const { rows } = await pool.query(query, params);

    /* fallback — if exclude left nothing, get any message */
    if (!rows[0] && excludeId) {
      const fallback = await pool.query(
        `SELECT id, content, burden, source, hearts
         FROM messages WHERE burden = $1
         ORDER BY RANDOM() LIMIT 1`,
        [burden]
      );
      return fallback.rows[0] || null;
    }

    return rows[0] || null;
  },

  async getAll(limit = 60) {
    const { rows } = await pool.query(
      `SELECT id, content, burden, source, hearts
       FROM messages ORDER BY RANDOM() LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async create({ content, burden }) {
    const { rows } = await pool.query(
      `INSERT INTO messages (content, burden, source)
       VALUES ($1, $2, 'community') RETURNING id`,
      [content.trim(), burden]
    );
    return { id: rows[0].id };
  },

  async addHeart(messageId, ipHash) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO message_hearts (message_id, ip_hash) VALUES ($1, $2)`,
        [messageId, ipHash]
      );
      const { rows } = await client.query(
        `UPDATE messages SET hearts = hearts + 1 WHERE id = $1 RETURNING hearts`,
        [messageId]
      );
      return { ok: true, hearts: rows[0].hearts };
    } catch (err) {
      if (err.code === '23505') return { ok: false, reason: 'already_hearted' };
      throw err;
    } finally {
      client.release();
    }
  },

};

module.exports = Message;