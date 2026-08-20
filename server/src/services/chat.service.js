import { db } from '../db/index.js';
import { getLogsForUser } from './log.service.js';
import { generateText } from './gemini.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const CHAT_LIMIT = 10;

const SYSTEM_INSTRUCTION =
  'You are a supportive wellness assistant inside a mental health tracking app called ' +
  'MindTrack. The user can see their own recent daily logs (mood, anxiety, sleep, activity, ' +
  'social interactions, stress, symptoms) below and may ask about patterns in it or general ' +
  'wellness questions. Be warm, concise (a few short paragraphs at most), and reference their ' +
  'actual data when relevant. You are NOT a therapist or doctor: never diagnose, never suggest ' +
  'medication, and if the user describes a crisis or self-harm, gently urge them to contact a ' +
  'crisis line or licensed professional immediately instead of trying to help yourself.';

function summarizeLogs(logs) {
  if (logs.length === 0) return 'No logs recorded yet.';
  return logs
    .map(
      (l) =>
        `${l.date}: mood ${l.mood}/5, anxiety ${l.anxiety}/5, stress ${l.stress_level}/5, ` +
        `sleep ${l.sleep_hours}h (quality ${l.sleep_quality}/5), social ${l.social_frequency}/5` +
        (l.activity_type ? `, activity: ${l.activity_type} (${l.activity_duration ?? '?'}min)` : '')
    )
    .join('\n');
}

/** Atomically consumes one chat credit. Returns remaining count, or null if exhausted. */
async function consumeChatCredit(userId) {
  const result = await db.execute({
    sql: `
      UPDATE users SET chat_count = chat_count + 1
      WHERE id = ? AND chat_count < ?
      RETURNING chat_count
    `,
    args: [userId, CHAT_LIMIT],
  });
  if (result.rows.length === 0) return null;
  return CHAT_LIMIT - Number(result.rows[0].chat_count);
}

export async function getRemainingChats(userId) {
  const result = await db.execute({
    sql: 'SELECT chat_count FROM users WHERE id = ?',
    args: [userId],
  });
  const used = Number(result.rows[0]?.chat_count ?? 0);
  return Math.max(0, CHAT_LIMIT - used);
}

/** Spends one chat credit and asks Gemini a question grounded in the user's recent logs. */
export async function askAssistant(userId, message) {
  const remaining = await consumeChatCredit(userId);
  if (remaining === null) {
    throw new AppError(403, "You've used all 10 free chat messages.");
  }

  const logs = await getLogsForUser(userId, 'month');
  const prompt = `Recent daily logs:\n${summarizeLogs(logs)}\n\nUser's question: ${message}`;

  const reply = await generateText(prompt, { systemInstruction: SYSTEM_INSTRUCTION });
  return { reply, remaining };
}
