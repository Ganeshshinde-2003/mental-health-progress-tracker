import { z } from 'zod';
import { askAssistant, getRemainingChats } from '../services/chat.service.js';

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(500),
});

export async function postChatMessage(req, res, next) {
  try {
    const { reply, remaining } = await askAssistant(req.user.id, req.body.message);
    res.json({ reply, remaining });
  } catch (err) {
    next(err);
  }
}

export async function fetchChatQuota(req, res, next) {
  try {
    const remaining = await getRemainingChats(req.user.id);
    res.json({ remaining });
  } catch (err) {
    next(err);
  }
}
