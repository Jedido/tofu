CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ign TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS anime_autocomplete (
  aka TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mal_id INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS anime_autocomplete_mal_id ON anime_autocomplete(aka);