/* ============================================================
   Submission.js — PostgreSQL
============================================================ */
const pool = require('../config/db');

const Submission = {

  async create({ content, burden }) {
    const { rows } = await pool.query(
      `INSERT INTO submissions (content, burden)
       VALUES ($1, $2) RETURNING id`,
      [content.trim(), burden]
    );
    return { id: rows[0].id };
  },

  async getRecent(burden, limit = 5) {
    const { rows } = await pool.query(
      `SELECT id, content, burden, created_at
       FROM submissions WHERE burden = $1
       ORDER BY created_at DESC LIMIT $2`,
      [burden, limit]
    );
    return rows;
  },

  async count() {
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM submissions`);
    return parseInt(rows[0].total);
  },

};

module.exports = Submission;