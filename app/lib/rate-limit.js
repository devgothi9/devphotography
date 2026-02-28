/**
 * Simple in-memory rate limiter (per IP).
 * Resets automatically after the window expires.
 * For production, consider Redis-backed rate limiting.
 */

const rateMap = new Map(); // ip -> { count, resetAt }

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;      // max 5 requests per window

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param {string} ip
 * @returns {boolean}
 */
export function rateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodic cleanup to prevent memory leaks (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);
