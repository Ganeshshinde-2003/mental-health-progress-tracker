CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  consented_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood INTEGER NOT NULL,
  anxiety INTEGER NOT NULL,
  sleep_hours REAL NOT NULL,
  sleep_quality INTEGER NOT NULL,
  sleep_disturbances TEXT,
  activity_type TEXT,
  activity_duration INTEGER,
  social_frequency INTEGER NOT NULL,
  stress_level INTEGER NOT NULL,
  symptoms TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_logs_user_date ON logs(user_id, date);
