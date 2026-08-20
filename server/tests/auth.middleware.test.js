import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/firebase.js', () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.unstable_mockModule('../src/services/user.service.js', () => ({
  findOrCreateUser: jest.fn(),
}));

const { firebaseAuth } = await import('../src/config/firebase.js');
const { findOrCreateUser } = await import('../src/services/user.service.js');
const { requireAuth } = await import('../src/middleware/auth.js');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    firebaseAuth.verifyIdToken.mockReset();
    findOrCreateUser.mockReset();
  });

  test('rejects with 401 when Authorization header is missing', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects with 401 when scheme is not Bearer', async () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects with 401 when token verification throws', async () => {
    firebaseAuth.verifyIdToken.mockRejectedValue(new Error('invalid token'));
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches req.user and calls next on valid token', async () => {
    firebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-1',
      email: 'user@example.com',
      name: 'Test User',
    });
    findOrCreateUser.mockResolvedValue({ id: 1, email: 'user@example.com' });

    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(findOrCreateUser).toHaveBeenCalledWith({
      firebaseUid: 'firebase-uid-1',
      email: 'user@example.com',
      displayName: 'Test User',
    });
    expect(req.user).toEqual({ id: 1, email: 'user@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
