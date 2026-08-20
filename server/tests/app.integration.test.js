import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../src/config/firebase.js', () => ({
  firebaseAuth: { verifyIdToken: jest.fn(), deleteUser: jest.fn() },
}));
jest.unstable_mockModule('../src/db/index.js', () => ({
  db: { execute: jest.fn() },
}));

const { firebaseAuth } = await import('../src/config/firebase.js');
const { db } = await import('../src/db/index.js');
const { app } = await import('../src/app.js');

const AUTHED_USER = {
  id: 1,
  firebase_uid: 'uid-1',
  email: 'user@example.com',
  consented_at: '2026-08-01T00:00:00Z',
};

function authAsExistingUser() {
  firebaseAuth.verifyIdToken.mockResolvedValue({
    uid: 'uid-1',
    email: 'user@example.com',
    name: 'Test User',
  });
  // requireAuth's findOrCreateUser -> SELECT finds an existing row.
  db.execute.mockImplementation(({ sql } = {}) => {
    if (typeof sql === 'string' && sql.includes('SELECT * FROM users WHERE firebase_uid')) {
      return Promise.resolve({ rows: [AUTHED_USER] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe('GET /health', () => {
  test('returns ok without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('protected routes without a token', () => {
  test('GET /api/logs returns 401', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  test('POST /api/log returns 401', async () => {
    const res = await request(app).post('/api/log').send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/log validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authAsExistingUser();
  });

  test('rejects a body missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer good-token')
      .send({ date: '2026-08-20' });

    expect(res.status).toBe(400);
  });

  test('rejects an out-of-range mood value with 400', async () => {
    const res = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer good-token')
      .send({
        date: '2026-08-20',
        mood: 9,
        anxiety: 2,
        sleepHours: 7,
        sleepQuality: 3,
        socialFrequency: 2,
        stressLevel: 3,
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/log without consent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    firebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'uid-2',
      email: 'noconsent@example.com',
      name: 'No Consent',
    });
    db.execute.mockResolvedValue({
      rows: [{ ...AUTHED_USER, id: 2, firebase_uid: 'uid-2', consented_at: null }],
    });
  });

  test('rejects with 403 before consent is given', async () => {
    const res = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer good-token')
      .send({
        date: '2026-08-20',
        mood: 3,
        anxiety: 2,
        sleepHours: 7,
        sleepQuality: 3,
        socialFrequency: 2,
        stressLevel: 3,
      });

    expect(res.status).toBe(403);
  });
});

describe('POST /api/log success path', () => {
  const VALID_PAYLOAD = {
    date: '2026-08-20',
    mood: 4,
    anxiety: 2,
    sleepHours: 7,
    sleepQuality: 3,
    socialFrequency: 3,
    stressLevel: 2,
    symptoms: [{ name: 'Low energy', severity: 1 }],
  };

  beforeEach(() => {
    jest.resetAllMocks();
    firebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      email: 'user@example.com',
      name: 'Test User',
    });
    db.execute.mockImplementation(({ sql } = {}) => {
      if (typeof sql === 'string' && sql.includes('SELECT * FROM users WHERE firebase_uid')) {
        return Promise.resolve({ rows: [AUTHED_USER] });
      }
      if (typeof sql === 'string' && sql.includes('INSERT INTO logs')) {
        return Promise.resolve({
          rows: [
            {
              id: 10,
              user_id: 1,
              date: VALID_PAYLOAD.date,
              mood: VALID_PAYLOAD.mood,
              anxiety: VALID_PAYLOAD.anxiety,
              stress_level: VALID_PAYLOAD.stressLevel,
              symptoms: JSON.stringify(VALID_PAYLOAD.symptoms),
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  test('returns 201 with the saved, deserialized log', async () => {
    const res = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer good-token')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(10);
    expect(res.body.symptoms).toEqual([{ name: 'Low energy', severity: 1 }]);
  });
});

describe('GET /api/export', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    firebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      email: 'user@example.com',
      name: 'Test User',
    });
    db.execute.mockImplementation(({ sql } = {}) => {
      if (typeof sql === 'string' && sql.includes('SELECT * FROM users WHERE firebase_uid')) {
        return Promise.resolve({ rows: [AUTHED_USER] });
      }
      if (typeof sql === 'string' && sql.includes('SELECT * FROM logs')) {
        return Promise.resolve({
          rows: [{ id: 1, date: '2026-08-01', mood: 3, symptoms: '[]' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  test('requires auth', async () => {
    const res = await request(app).get('/api/export');
    expect(res.status).toBe(401);
  });

  test('returns the user email and all their logs as JSON', async () => {
    const res = await request(app)
      .get('/api/export')
      .set('Authorization', 'Bearer good-token');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('user@example.com');
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0].symptoms).toEqual([]);
  });
});

describe('DELETE /api/auth/me', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authAsExistingUser();
    firebaseAuth.deleteUser.mockResolvedValue(undefined);
  });

  test('requires auth', async () => {
    const res = await request(app).delete('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('deletes the DB user and the Firebase Auth account, returns 204', async () => {
    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', 'Bearer good-token');

    expect(res.status).toBe(204);
    expect(firebaseAuth.deleteUser).toHaveBeenCalledWith('uid-1');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authAsExistingUser();
  });

  test('returns the authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer good-token');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('user@example.com');
  });
});
