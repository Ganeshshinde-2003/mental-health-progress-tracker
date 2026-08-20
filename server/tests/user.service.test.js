import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/db/index.js', () => ({
  db: { execute: jest.fn() },
}));

const { db } = await import('../src/db/index.js');
const { findOrCreateUser, setConsent, deleteUser } = await import(
  '../src/services/user.service.js'
);

describe('user.service', () => {
  beforeEach(() => {
    db.execute.mockReset();
  });

  test('findOrCreateUser returns existing user without inserting', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, firebase_uid: 'uid-1' }] });

    const user = await findOrCreateUser({
      firebaseUid: 'uid-1',
      email: 'a@b.com',
      displayName: 'A B',
    });

    expect(db.execute).toHaveBeenCalledTimes(1);
    expect(user).toEqual({ id: 1, firebase_uid: 'uid-1' });
  });

  test('findOrCreateUser inserts a new user when none exists', async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 2, firebase_uid: 'uid-2' }] });

    const user = await findOrCreateUser({
      firebaseUid: 'uid-2',
      email: 'c@d.com',
      displayName: undefined,
    });

    expect(db.execute).toHaveBeenCalledTimes(2);
    const insertCall = db.execute.mock.calls[1][0];
    expect(insertCall.args).toEqual(['uid-2', 'c@d.com', null]);
    expect(user).toEqual({ id: 2, firebase_uid: 'uid-2' });
  });

  test('setConsent updates consented_at and returns the row', async () => {
    db.execute.mockResolvedValue({ rows: [{ id: 1, consented_at: '2026-08-01' }] });

    const user = await setConsent(1);

    expect(db.execute).toHaveBeenCalledWith(
      expect.objectContaining({ args: [1] })
    );
    expect(user.consented_at).toBe('2026-08-01');
  });

  test('deleteUser executes a DELETE with the given id', async () => {
    db.execute.mockResolvedValue({ rows: [] });

    await deleteUser(5);

    expect(db.execute).toHaveBeenCalledWith(
      expect.objectContaining({ sql: expect.stringContaining('DELETE FROM users'), args: [5] })
    );
  });
});
