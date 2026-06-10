/* ============================================================
   rateLimit.js — protects POST endpoints from spam
   Uses express-rate-limit, no Redis needed
============================================================ */
const rateLimit = require('express-rate-limit');

/* General submissions — 10 posts per 15 minutes per IP */
const submitLimit = rateLimit({
  windowMs:  15 * 60 * 1000,
  max:       10,
  message:   { error: 'Too many submissions. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* Heart actions — 30 per 5 minutes per IP */
const heartLimit = rateLimit({
  windowMs:  5 * 60 * 1000,
  max:       30,
  message:   { error: 'Slow down. Take a breath.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { submitLimit, heartLimit };