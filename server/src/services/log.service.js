import { db } from '../db/index.js';

export async function upsertLog(userId, log) {
  const result = await db.execute({
    sql: `
      INSERT INTO logs (
        user_id, date, mood, anxiety, sleep_hours, sleep_quality,
        sleep_disturbances, activity_type, activity_duration,
        social_frequency, stress_level, symptoms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        mood = excluded.mood,
        anxiety = excluded.anxiety,
        sleep_hours = excluded.sleep_hours,
        sleep_quality = excluded.sleep_quality,
        sleep_disturbances = excluded.sleep_disturbances,
        activity_type = excluded.activity_type,
        activity_duration = excluded.activity_duration,
        social_frequency = excluded.social_frequency,
        stress_level = excluded.stress_level,
        symptoms = excluded.symptoms
      RETURNING *
    `,
    args: [
      userId,
      log.date,
      log.mood,
      log.anxiety,
      log.sleepHours,
      log.sleepQuality,
      log.sleepDisturbances ?? null,
      log.activityType ?? null,
      log.activityDuration ?? null,
      log.socialFrequency,
      log.stressLevel,
      JSON.stringify(log.symptoms ?? []),
    ],
  });

  return deserializeLog(result.rows[0]);
}

export async function getLogsForUser(userId, range = 'month') {
  const days = range === 'week' ? 7 : 30;

  const result = await db.execute({
    sql: `
      SELECT * FROM logs
      WHERE user_id = ? AND date >= date('now', ?)
      ORDER BY date ASC
    `,
    args: [userId, `-${days} days`],
  });

  return result.rows.map(deserializeLog);
}

export async function getAllLogsForUser(userId) {
  const result = await db.execute({
    sql: 'SELECT * FROM logs WHERE user_id = ? ORDER BY date ASC',
    args: [userId],
  });
  return result.rows.map(deserializeLog);
}

function deserializeLog(row) {
  return {
    ...row,
    symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
  };
}
