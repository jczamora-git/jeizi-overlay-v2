CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shortname VARCHAR(100),
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS casters (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maps (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon_path TEXT,
  map_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS heroes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  lane VARCHAR(255),
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  match_no INTEGER,
  blue_team_id BIGINT NOT NULL REFERENCES teams(id),
  red_team_id BIGINT NOT NULL REFERENCES teams(id),
  mode VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  caster_ids TEXT,
  queue_order INTEGER,
  blue_score INTEGER NOT NULL DEFAULT 0,
  red_score INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  series_completed SMALLINT NOT NULL DEFAULT 0,
  series_winner_team_id BIGINT REFERENCES teams(id),
  series_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  game_no INTEGER NOT NULL,
  map_id BIGINT REFERENCES maps(id),
  status VARCHAR(50) NOT NULL DEFAULT 'setup',
  winner_team_id BIGINT REFERENCES teams(id),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS draft_sessions (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  game_id BIGINT REFERENCES games(id) ON DELETE SET NULL,
  game_number INTEGER NOT NULL,
  blue_team_id BIGINT REFERENCES teams(id),
  red_team_id BIGINT REFERENCES teams(id),
  mode VARCHAR(20),
  phase_index INTEGER NOT NULL DEFAULT 0,
  phase_label VARCHAR(255),
  timer_remaining INTEGER,
  timer_running SMALLINT NOT NULL DEFAULT 0,
  status VARCHAR(50),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS draft_slots (
  id BIGSERIAL PRIMARY KEY,
  draft_session_id BIGINT NOT NULL REFERENCES draft_sessions(id) ON DELETE CASCADE,
  team_side VARCHAR(20) NOT NULL,
  slot_type VARCHAR(20) NOT NULL,
  slot_index INTEGER NOT NULL,
  phase_index INTEGER,
  phase_label VARCHAR(255),
  hero_id BIGINT REFERENCES heroes(id) ON DELETE SET NULL,
  hero_name VARCHAR(255),
  hero_role VARCHAR(255),
  hero_lane VARCHAR(255),
  hero_image_path TEXT,
  is_locked SMALLINT NOT NULL DEFAULT 0,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_draft_slot UNIQUE (draft_session_id, team_side, slot_type, slot_index)
);

CREATE TABLE IF NOT EXISTS draft_actions (
  id BIGSERIAL PRIMARY KEY,
  draft_session_id BIGINT REFERENCES draft_sessions(id) ON DELETE SET NULL,
  game_id BIGINT REFERENCES games(id) ON DELETE CASCADE,
  team_side VARCHAR(20) NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  hero_id BIGINT REFERENCES heroes(id) ON DELETE SET NULL,
  action_order INTEGER,
  phase_index INTEGER,
  phase_label VARCHAR(255),
  slot_index INTEGER,
  locked SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS overlay_settings (
  overlay_key VARCHAR(100) PRIMARY KEY,
  is_enabled SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO overlay_settings (overlay_key, is_enabled)
VALUES ('game_overlay', 1), ('loading_overlay', 1)
ON CONFLICT (overlay_key) DO UPDATE
SET is_enabled = EXCLUDED.is_enabled;
