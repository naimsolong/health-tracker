-- Migration: Add subscription support and file storage

-- Add subscription columns to users
ALTER TABLE users ADD COLUMN stripe_customer_id     TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status    TEXT NOT NULL DEFAULT 'free';

-- Table for uploaded files (Pro users only)
CREATE TABLE user_files (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key      TEXT NOT NULL,
  filename    TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_user_files_user_id ON user_files(user_id);
