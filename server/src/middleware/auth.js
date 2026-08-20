import { firebaseAuth } from '../config/firebase.js';
import { findOrCreateUser } from '../services/user.service.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    const user = await findOrCreateUser({
      firebaseUid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
    });
    req.user = user;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
