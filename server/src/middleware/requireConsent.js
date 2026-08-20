export function requireConsent(req, res, next) {
  if (!req.user.consented_at) {
    return res.status(403).json({ error: 'Consent required before logging data' });
  }
  next();
}
