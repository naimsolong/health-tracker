-- Migration: 0002_health_expansion
-- Expands health tracker schema with additional vital signs, medical profile,
-- lab results, symptoms log, and vaccination history.

-- ============================================================
-- 1. Add daily vital sign columns to health_entries
-- ============================================================

ALTER TABLE health_entries ADD COLUMN temperature          REAL;
ALTER TABLE health_entries ADD COLUMN respiratory_rate     INTEGER;
ALTER TABLE health_entries ADD COLUMN spo2                 REAL;
ALTER TABLE health_entries ADD COLUMN waist_circumference  REAL;

-- ============================================================
-- 2. Static medical profile (one row per user, upserted)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_medical_profile (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  height              REAL,
  blood_type          TEXT,
  date_of_birth       TEXT,
  biological_sex      TEXT,
  smoking_status      TEXT,
  alcohol_use         TEXT,
  allergies           TEXT,
  chronic_conditions  TEXT,
  current_medications TEXT,
  family_history      TEXT,
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 3. Periodic lab results (one row per test per date)
-- ============================================================

CREATE TABLE IF NOT EXISTS lab_results (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_date      TEXT NOT NULL,
  test_category  TEXT NOT NULL,
  test_name      TEXT NOT NULL,
  value          REAL NOT NULL,
  unit           TEXT NOT NULL,
  reference_low  REAL,
  reference_high REAL,
  lab_name       TEXT,
  ordered_by     TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lab_results_user_id        ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_date      ON lab_results(test_date);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_test_name ON lab_results(user_id, test_name);

-- ============================================================
-- 4. Symptoms log (multiple symptoms per day supported)
-- ============================================================

CREATE TABLE IF NOT EXISTS symptoms_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_at    TEXT NOT NULL,
  date         TEXT NOT NULL,
  symptom      TEXT NOT NULL,
  severity     INTEGER CHECK(severity BETWEEN 1 AND 10),
  duration_min INTEGER,
  notes        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_symptoms_log_user_id ON symptoms_log(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_log_date    ON symptoms_log(date);

-- ============================================================
-- 5. Vaccination history (append-only)
-- ============================================================

CREATE TABLE IF NOT EXISTS vaccinations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  date_given      TEXT NOT NULL,
  dose_number     INTEGER,
  manufacturer    TEXT,
  lot_number      TEXT,
  administered_by TEXT,
  next_due_date   TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON vaccinations(user_id);
