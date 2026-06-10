/* ============================================================
   db.js — SQLite connection + all table creation
============================================================ */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

/* ------------------------------------------------------------
   Ensure data folder exists
------------------------------------------------------------ */
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/* ------------------------------------------------------------
   Database path
------------------------------------------------------------ */
const DB_PATH =
  process.env.DB_PATH ||
  path.join(dataDir, 'weightwecarry.db');

/* ------------------------------------------------------------
   Connect SQLite
------------------------------------------------------------ */
const db = new Database(DB_PATH);

/* WAL mode = faster reads, safer concurrent writes */
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ---- stories: anonymous entries from Section 3 & 5 ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS stories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    content    TEXT    NOT NULL CHECK(length(content) <= 500),
    burden     TEXT    NOT NULL,
    country    TEXT    NOT NULL DEFAULT 'Anonymous',
    source     TEXT    NOT NULL DEFAULT 'community',
    approved   INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

/* ---- letters: long emotional letters from Section 4 ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS letters (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    from_line  TEXT    NOT NULL DEFAULT 'Anonymous',
    burden     TEXT    NOT NULL,
    source     TEXT    NOT NULL DEFAULT 'seeded',
    hearts     INTEGER NOT NULL DEFAULT 0,
    approved   INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

/* ---- messages: short messages left behind (Section 6 & 7) ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    content    TEXT    NOT NULL CHECK(length(content) <= 300),
    burden     TEXT    NOT NULL,
    source     TEXT    NOT NULL DEFAULT 'community',
    hearts     INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

/* ---- submissions: "If Men Were Honest" (Section 5) ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    content    TEXT    NOT NULL CHECK(length(content) <= 500),
    burden     TEXT    NOT NULL,
    promoted   INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

/* ---- letter_hearts: one heart per IP per letter ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS letter_hearts (
    letter_id  INTEGER NOT NULL,
    ip_hash    TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (letter_id, ip_hash)
  )
`);

/* ---- message_hearts: one heart per IP per message ---- */
db.exec(`
  CREATE TABLE IF NOT EXISTS message_hearts (
    message_id INTEGER NOT NULL,
    ip_hash    TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (message_id, ip_hash)
  )
`);

console.log('✅ SQLite connected:', DB_PATH);

module.exports = db;