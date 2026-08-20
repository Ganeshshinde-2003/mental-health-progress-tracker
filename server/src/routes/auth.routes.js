import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { firebaseAuth } from '../config/firebase.js';
import { setConsent, deleteUser } from '../services/user.service.js';

export const authRoutes = Router();

// Login itself happens client-side via Firebase (Google popup/redirect).
// This endpoint just confirms the token is valid and returns/creates the user record.
authRoutes.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRoutes.post('/consent', requireAuth, async (req, res, next) => {
  try {
    const user = await setConsent(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

authRoutes.delete('/me', requireAuth, async (req, res, next) => {
  try {
    // Delete our DB record first (cascades logs), then the Firebase Auth account.
    // If the Firebase deletion fails, the user still can't log old data back in
    // without re-authenticating, and can retry deletion.
    await deleteUser(req.user.id);
    await firebaseAuth.deleteUser(req.user.firebase_uid);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
