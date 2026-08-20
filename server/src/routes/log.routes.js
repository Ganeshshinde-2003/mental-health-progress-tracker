import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireConsent } from '../middleware/requireConsent.js';
import { validateBody } from '../middleware/validate.js';
import { createLog, listLogs, logSchema, exportLogs } from '../controllers/log.controller.js';

export const logRoutes = Router();

logRoutes.post('/log', requireAuth, requireConsent, validateBody(logSchema), createLog);
logRoutes.get('/logs', requireAuth, listLogs);
logRoutes.get('/export', requireAuth, exportLogs);
