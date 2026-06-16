/* ============================================================
   db.js — PostgreSQL connection + table creation
   Uses the pg Pool for async queries
   Tables are created on first startup if they don't exist
============================================================ */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

/* ============================================================
   CREATE TABLES — runs on startup, safe to run multiple times
============================================================ */
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id         SERIAL PRIMARY KEY,
        content    TEXT    NOT NULL CHECK(char_length(content) <= 500),
        burden     TEXT    NOT NULL,
        country    TEXT    NOT NULL DEFAULT 'Anonymous',
        source     TEXT    NOT NULL DEFAULT 'community',
        approved   BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS letters (
        id         SERIAL PRIMARY KEY,
        title      TEXT    NOT NULL,
        body       JSONB   NOT NULL,
        from_line  TEXT    NOT NULL DEFAULT 'Anonymous',
        burden     TEXT    NOT NULL,
        source     TEXT    NOT NULL DEFAULT 'seeded',
        hearts     INTEGER NOT NULL DEFAULT 0,
        approved   BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        content    TEXT    NOT NULL CHECK(char_length(content) <= 300),
        burden     TEXT    NOT NULL,
        source     TEXT    NOT NULL DEFAULT 'community',
        hearts     INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id         SERIAL PRIMARY KEY,
        content    TEXT    NOT NULL CHECK(char_length(content) <= 500),
        burden     TEXT    NOT NULL,
        promoted   BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS letter_hearts (
        letter_id  INTEGER NOT NULL,
        ip_hash    TEXT    NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (letter_id, ip_hash)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS message_hearts (
        message_id INTEGER NOT NULL,
        ip_hash    TEXT    NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (message_id, ip_hash)
      )
    `);

    console.log('✅ PostgreSQL connected and tables ready');
  } finally {
    client.release();
  }
}

initDB().catch(err => {
  console.error('❌ Database init failed:', err.message);
  process.exit(1);
});

module.exports = pool;