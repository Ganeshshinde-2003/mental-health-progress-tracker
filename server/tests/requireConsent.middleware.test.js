import { jest } from '@jest/globals';
import { requireConsent } from '../src/middleware/requireConsent.js';

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireConsent middleware', () => {
  test('rejects with 403 when user has not consented', () => {
    const req = { user: { consented_at: null } };
    const res = mockRes();
    const next = jest.fn();

    requireConsent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when user has consented', () => {
    const req = { user: { consented_at: '2026-08-01T00:00:00Z' } };
    const res = mockRes();
    const next = jest.fn();

    requireConsent(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
