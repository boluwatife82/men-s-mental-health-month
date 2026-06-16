/* ============================================================
   Story.js — PostgreSQL
============================================================ */
const pool = require('../config/db');

const Story = {

  async getByBurden(burden, limit = 20) {
    const { rows } = await pool.query(
      `SELECT id, content, burden, country, source, created_at
       FROM stories WHERE burden = $1 AND approved = true
       ORDER BY created_at DESC LIMIT $2`,
      [burden, limit]
    );
    return rows;
  },

  async countByBurden(burden) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int as total FROM stories WHERE burden = $1 AND approved = true`,
      [burden]
    );
    return rows[0].total || 0;
  },

  async create({ content, burden, country = 'Anonymous' }) {
    const { rows } = await pool.query(
      `INSERT INTO stories (content, burden, country, source, approved)
       VALUES ($1, $2, $3, 'community', true) RETURNING id`,
      [content.trim(), burden, country.trim()]
    );
    return { id: rows[0].id };
  },

};

module.exports = Story;