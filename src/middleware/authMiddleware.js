/**
 * requireAuth – blocks unauthenticated requests to protected routes.
 * Attaches req.session.userId so controllers can identify the caller.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "You must be logged in to do that" });
  }
  next();
}

/**
 * requireAdmin – further restricts a route to the single administrator account.
 * Must be used AFTER requireAuth.
 */
function requireAdmin(req, res, next) {
  if (req.session.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

/**
 * Simple in-memory rate limiter for authentication endpoints.
 * Limits each IP to `max` requests per `windowMs` milliseconds.
 */
function rateLimiter({ windowMs = 15 * 60 * 1000, max = 20 } = {}) {
  const hits = new Map();

  // Clean up old entries periodically to avoid memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now - entry.start > windowMs) {
        hits.delete(key);
      }
    }
  }, windowMs);

  return function (req, res, next) {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message: "Too many requests. Please wait a moment." });
    }

    next();
  };
}

module.exports = { requireAuth, requireAdmin, rateLimiter };