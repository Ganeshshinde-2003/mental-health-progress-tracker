import { upsertLog } from '../src/services/log.service.js';

const USER_ID = 1;
const START = new Date('2026-08-01');
const END = new Date('2026-08-20');

const ACTIVITIES = ['Walk', 'Run', 'Yoga', 'Gym', 'None'];
const DISTURBANCES = ['None', 'Woke up often', 'Nightmares', 'Trouble falling asleep'];
const SYMPTOM_POOL = ['Low energy', 'Trouble concentrating', 'Irritability', 'Hopelessness', 'Restlessness'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const dates = [];
  for (let d = new Date(START); d <= END; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    // Gentle upward trend over the period, plus daily noise, clamped 1-5.
    const trend = 2.5 + (i / dates.length) * 1.5;
    const mood = Math.max(1, Math.min(5, Math.round(trend + randInt(-1, 1))));
    const anxiety = Math.max(1, Math.min(5, Math.round(6 - trend + randInt(-1, 1))));
    const stressLevel = Math.max(1, Math.min(5, Math.round(6 - trend + randInt(-1, 1))));

    const symptomCount = randInt(0, 2);
    const symptoms = [];
    const pool = [...SYMPTOM_POOL];
    for (let s = 0; s < symptomCount; s++) {
      const idx = randInt(0, pool.length - 1);
      symptoms.push({ name: pool[idx], severity: randInt(0, 3) });
      pool.splice(idx, 1);
    }

    await upsertLog(USER_ID, {
      date: dateStr(date),
      mood,
      anxiety,
      sleepHours: randInt(5, 9) + (Math.random() < 0.5 ? 0 : 0.5),
      sleepQuality: randInt(2, 5),
      sleepDisturbances: pick(DISTURBANCES),
      activityType: pick(ACTIVITIES),
      activityDuration: randInt(0, 60),
      socialFrequency: randInt(1, 5),
      stressLevel,
      symptoms,
    });

    console.log(`Seeded ${dateStr(date)}`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
