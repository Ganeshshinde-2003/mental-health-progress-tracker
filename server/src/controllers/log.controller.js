import { z } from 'zod';
import { upsertLog, getLogsForUser, getAllLogsForUser } from '../services/log.service.js';
import { emitNewLog } from '../sockets/index.js';
import { invalidateInsight } from '../services/insight.service.js';

export const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  mood: z.number().int().min(1).max(5),
  anxiety: z.number().int().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().int().min(1).max(5),
  sleepDisturbances: z.string().max(280).optional(),
  activityType: z.string().max(60).optional(),
  activityDuration: z.number().int().min(0).max(1440).optional(),
  socialFrequency: z.number().int().min(1).max(5),
  stressLevel: z.number().int().min(1).max(5),
  symptoms: z
    .array(
      z.object({
        name: z.string().max(60),
        severity: z.number().int().min(0).max(3),
      })
    )
    .optional(),
});

export async function createLog(req, res, next) {
  try {
    const saved = await upsertLog(req.user.id, req.body);
    invalidateInsight(req.user.id);
    emitNewLog(req.user.firebase_uid, saved);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

export async function listLogs(req, res, next) {
  try {
    const range = req.query.range === 'week' ? 'week' : 'month';
    const logs = await getLogsForUser(req.user.id, range);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function exportLogs(req, res, next) {
  try {
    const logs = await getAllLogsForUser(req.user.id);
    res.setHeader('Content-Disposition', 'attachment; filename="my-health-data.json"');
    res.json({ user: { email: req.user.email }, logs });
  } catch (err) {
    next(err);
  }
}
