/* ============================================================
   Letter.js — PostgreSQL
============================================================ */
const pool = require('../config/db');

const Letter = {

  async getByBurden(burden) {
    const { rows } = await pool.query(
      `SELECT id, title, body, from_line, burden, source, hearts, created_at
       FROM letters WHERE burden = $1 AND approved = true
       ORDER BY hearts DESC`,
      [burden]
    );
    return rows;
  },

  async getRandom(burden, excludeId = null) {
    const query = excludeId
      ? `SELECT id, title, body, from_line, burden, source, hearts
         FROM letters WHERE burden = $1 AND approved = true AND id != $2
         ORDER BY RANDOM() LIMIT 1`
      : `SELECT id, title, body, from_line, burden, source, hearts
         FROM letters WHERE burden = $1 AND approved = true
         ORDER BY RANDOM() LIMIT 1`;

    const params = excludeId ? [burden, excludeId] : [burden];
    const { rows } = await pool.query(query, params);

    /* fallback — if exclude left nothing, get any letter */
    if (!rows[0] && excludeId) {
      const fallback = await pool.query(
        `SELECT id, title, body, from_line, burden, source, hearts
         FROM letters WHERE burden = $1 AND approved = true
         ORDER BY RANDOM() LIMIT 1`,
        [burden]
      );
      return fallback.rows[0] || null;
    }

    return rows[0] || null;
  },

  async addHeart(letterId, ipHash) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO letter_hearts (letter_id, ip_hash) VALUES ($1, $2)`,
        [letterId, ipHash]
      );
      const { rows } = await client.query(
        `UPDATE letters SET hearts = hearts + 1 WHERE id = $1 RETURNING hearts`,
        [letterId]
      );
      return { ok: true, hearts: rows[0].hearts };
    } catch (err) {
      /* unique violation = already hearted */
      if (err.code === '23505') return { ok: false, reason: 'already_hearted' };
      throw err;
    } finally {
      client.release();
    }
  },

  async create({ title, body, from_line = 'Anonymous', burden }) {
    const paragraphs = Array.isArray(body)
      ? body
      : body.split('\n').map(p => p.trim()).filter(Boolean);

    const { rows } = await pool.query(
      `INSERT INTO letters (title, body, from_line, burden, source, approved)
       VALUES ($1, $2, $3, $4, 'community', false) RETURNING id`,
      [title.trim(), JSON.stringify(paragraphs), from_line.trim(), burden]
    );
    return { id: rows[0].id };
  },

};

module.exports = Letter;