import { jest } from '@jest/globals';
import { z } from 'zod';
import { validateBody } from '../src/middleware/validate.js';

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const schema = z.object({ name: z.string().min(1) });

describe('validateBody middleware', () => {
  test('rejects with 400 and details on invalid body', () => {
    const req = { body: { name: '' } };
    const res = mockRes();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('replaces req.body with parsed data and calls next on valid body', () => {
    const req = { body: { name: 'MindTrack', extra: 'stripped-if-not-in-schema' } };
    const res = mockRes();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ name: 'MindTrack' });
  });
});
