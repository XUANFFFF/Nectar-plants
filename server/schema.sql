CREATE TABLE IF NOT EXISTS observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_record_id TEXT UNIQUE,
  dataset_name TEXT,
  dataset_id TEXT,
  license TEXT DEFAULT 'CC BY-NC 4.0',
  observer TEXT,
  observer_id TEXT,
  event_date TEXT,
  date_identified TEXT,
  chinese_name TEXT,
  scientific_name TEXT,
  scientific_name_id TEXT,
  family TEXT,
  family_chinese_name TEXT,
  genus TEXT,
  genus_chinese_name TEXT,
  country TEXT DEFAULT '中国',
  province TEXT,
  city TEXT,
  county TEXT,
  longitude REAL,
  latitude REAL,
  elevation REAL,
  location_id TEXT,
  establishment_means TEXT,
  habitat_type TEXT,
  associated_taxa TEXT,
  remarks TEXT,
  verbatim_identification TEXT,
  identified_by TEXT,
  identified_by_id TEXT,
  verification_status TEXT DEFAULT '待审核',
  media_url TEXT,
  media_urls TEXT,
  source_media_urls TEXT,
  raw_payload TEXT,
  import_batch_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS import_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'uploaded',
  total_rows INTEGER DEFAULT 0,
  valid_rows INTEGER DEFAULT 0,
  invalid_rows INTEGER DEFAULT 0,
  duplicate_rows INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TEXT DEFAULT (datetime('now')),
  imported_at TEXT,
  error_summary TEXT
);

CREATE TABLE IF NOT EXISTS import_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_batch_id INTEGER,
  row_number INTEGER,
  field_name TEXT,
  error_code TEXT,
  message TEXT,
  raw_value TEXT,
  raw_row TEXT,
  FOREIGN KEY (import_batch_id) REFERENCES import_batches(id)
);

CREATE INDEX IF NOT EXISTS idx_observations_city ON observations(city);
CREATE INDEX IF NOT EXISTS idx_observations_chinese_name ON observations(chinese_name);
CREATE INDEX IF NOT EXISTS idx_observations_observer ON observations(observer);
CREATE INDEX IF NOT EXISTS idx_observations_import_batch ON observations(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_observations_verification ON observations(verification_status);
