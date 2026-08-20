import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/firebase.js', () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));

const { firebaseAuth } = await import('../src/config/firebase.js');
const { socketAuthMiddleware } = await import('../src/sockets/index.js');

describe('socketAuthMiddleware', () => {
  beforeEach(() => {
    firebaseAuth.verifyIdToken.mockReset();
  });

  test('rejects a connection with no token in the handshake', async () => {
    const socket = { handshake: { auth: {} }, data: {} };
    const next = jest.fn();

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('unauthorized');
  });

  test('rejects a connection when token verification fails', async () => {
    firebaseAuth.verifyIdToken.mockRejectedValue(new Error('expired'));
    const socket = { handshake: { auth: { token: 'bad' } }, data: {} };
    const next = jest.fn();

    await socketAuthMiddleware(socket, next);

    expect(next.mock.calls[0][0].message).toBe('unauthorized');
  });

  test('attaches firebaseUid to socket.data and calls next() with no error on success', async () => {
    firebaseAuth.verifyIdToken.mockResolvedValue({ uid: 'uid-123' });
    const socket = { handshake: { auth: { token: 'good' } }, data: {} };
    const next = jest.fn();

    await socketAuthMiddleware(socket, next);

    expect(socket.data.firebaseUid).toBe('uid-123');
    expect(next).toHaveBeenCalledWith();
  });
});
