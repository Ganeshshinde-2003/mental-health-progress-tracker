import { getLogsForUser } from './log.service.js';
import { generateText } from './gemini.service.js';

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

const SYSTEM_INSTRUCTION =
  'You are a warm, concise wellness companion inside a mental health tracking app. ' +
  'Given a summary of a user\'s recent daily logs, write ONE short, human, encouraging ' +
  'sentence (max 220 characters) noticing a real pattern in the data. Be specific, never ' +
  'generic. Never give medical advice or diagnose. Never mention you are an AI.';

function summarizeLogs(logs) {
  return logs
    .map(
      (l) =>
        `${l.date}: mood ${l.mood}/5, anxiety ${l.anxiety}/5, stress ${l.stress_level}/5, ` +
        `sleep ${l.sleep_hours}h (quality ${l.sleep_quality}/5)`
    )
    .join('\n');
}

/** Returns a cached or freshly-generated one-line insight for the user's recent logs. */
export async function getInsight(userId) {
  const cached = cache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.text;

  const logs = await getLogsForUser(userId, 'week');
  if (logs.length < 2) return null;

  const prompt = `Recent daily logs:\n${summarizeLogs(logs)}`;
  const text = await generateText(prompt, { systemInstruction: SYSTEM_INSTRUCTION });

  cache.set(userId, { text, expiresAt: Date.now() + CACHE_TTL_MS });
  return text;
}

/** Drops a user's cached insight so the next request regenerates it. */
export function invalidateInsight(userId) {
  cache.delete(userId);
}
