import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireConsent } from '../middleware/requireConsent.js';
import { validateBody } from '../middleware/validate.js';
import { fetchInsight } from '../controllers/insight.controller.js';
import {
  postChatMessage,
  fetchChatQuota,
  chatMessageSchema,
} from '../controllers/chat.controller.js';

export const aiRoutes = Router();

aiRoutes.get('/insight', requireAuth, requireConsent, fetchInsight);
aiRoutes.get('/chat/quota', requireAuth, requireConsent, fetchChatQuota);
aiRoutes.post('/chat', requireAuth, requireConsent, validateBody(chatMessageSchema), postChatMessage);
