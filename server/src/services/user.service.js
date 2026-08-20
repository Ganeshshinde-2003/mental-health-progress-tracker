import { db } from '../db/index.js';

export async function findOrCreateUser({ firebaseUid, email, displayName }) {
  const existing = await db.execute({
    sql: 'SELECT * FROM users WHERE firebase_uid = ?',
    args: [firebaseUid],
  });

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const inserted = await db.execute({
    sql: 'INSERT INTO users (firebase_uid, email, display_name) VALUES (?, ?, ?) RETURNING *',
    args: [firebaseUid, email, displayName ?? null],
  });

  return inserted.rows[0];
}

export async function setConsent(userId) {
  const result = await db.execute({
    sql: "UPDATE users SET consented_at = datetime('now') WHERE id = ? RETURNING *",
    args: [userId],
  });
  return result.rows[0];
}

export async function deleteUser(userId) {
  await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
}
