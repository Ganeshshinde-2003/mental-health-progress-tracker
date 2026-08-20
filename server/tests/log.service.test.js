import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/db/index.js', () => ({
  db: {
    execute: jest.fn(),
  },
}));

const { db } = await import('../src/db/index.js');
const { upsertLog, getLogsForUser } = await import('../src/services/log.service.js');

describe('log.service', () => {
  beforeEach(() => {
    db.execute.mockReset();
  });

  test('upsertLog inserts and returns a deserialized log', async () => {
    db.execute.mockResolvedValue({
      rows: [{ id: 1, user_id: 1, date: '2026-08-19', symptoms: '[{"name":"low energy","severity":2}]' }],
    });

    const result = await upsertLog(1, {
      date: '2026-08-19',
      mood: 4,
      anxiety: 2,
      sleepHours: 7,
      sleepQuality: 3,
      socialFrequency: 2,
      stressLevel: 3,
      symptoms: [{ name: 'low energy', severity: 2 }],
    });

    expect(db.execute).toHaveBeenCalledTimes(1);
    expect(result.symptoms).toEqual([{ name: 'low energy', severity: 2 }]);
  });

  test('getLogsForUser queries with correct day range for week', async () => {
    db.execute.mockResolvedValue({ rows: [] });

    await getLogsForUser(1, 'week');

    const call = db.execute.mock.calls[0][0];
    expect(call.args).toEqual([1, '-7 days']);
  });

  test('getLogsForUser defaults to month range', async () => {
    db.execute.mockResolvedValue({ rows: [] });

    await getLogsForUser(1, 'month');

    const call = db.execute.mock.calls[0][0];
    expect(call.args).toEqual([1, '-30 days']);
  });
});
