CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ign TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS anime_autocomplete (
  aka TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mal_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mal_anime_cache (
  mal_id INTEGER PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS anime_sources (
  mal_id INTEGER PRIMARY KEY,
  source_id INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS anime_autocomplete_mal_id ON anime_autocomplete(aka);