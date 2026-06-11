CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shortname VARCHAR(100) NULL,
  logo TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS casters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon_path TEXT NULL,
  map_image TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heroes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NULL,
  lane VARCHAR(255) NULL,
  image_path TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_no INT NULL,
  blue_team_id INT NOT NULL,
  red_team_id INT NOT NULL,
  mode VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  caster_ids TEXT NULL,
  queue_order INT NULL,
  blue_score INT NOT NULL DEFAULT 0,
  red_score INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  series_completed TINYINT(1) NOT NULL DEFAULT 0,
  series_winner_team_id INT NULL,
  series_completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_matches_blue_team FOREIGN KEY (blue_team_id) REFERENCES teams(id),
  CONSTRAINT fk_matches_red_team FOREIGN KEY (red_team_id) REFERENCES teams(id),
  CONSTRAINT fk_matches_series_winner FOREIGN KEY (series_winner_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  game_no INT NOT NULL,
  map_id INT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'setup',
  winner_team_id INT NULL,
  finished_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_games_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_games_map FOREIGN KEY (map_id) REFERENCES maps(id),
  CONSTRAINT fk_games_winner FOREIGN KEY (winner_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS draft_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  game_id INT NULL,
  game_number INT NOT NULL,
  blue_team_id INT NULL,
  red_team_id INT NULL,
  mode VARCHAR(20) NULL,
  phase_index INT NOT NULL DEFAULT 0,
  phase_label VARCHAR(255) NULL,
  timer_remaining INT NULL,
  timer_running TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  locked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_draft_sessions_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_draft_sessions_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS draft_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draft_session_id INT NOT NULL,
  team_side VARCHAR(20) NOT NULL,
  slot_type VARCHAR(20) NOT NULL,
  slot_index INT NOT NULL,
  phase_index INT NULL,
  phase_label VARCHAR(255) NULL,
  hero_id INT NULL,
  hero_name VARCHAR(255) NULL,
  hero_role VARCHAR(255) NULL,
  hero_lane VARCHAR(255) NULL,
  hero_image_path TEXT NULL,
  is_locked TINYINT(1) NOT NULL DEFAULT 0,
  locked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_draft_slot (draft_session_id, team_side, slot_type, slot_index),
  CONSTRAINT fk_draft_slots_session FOREIGN KEY (draft_session_id) REFERENCES draft_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_draft_slots_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS draft_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draft_session_id INT NULL,
  game_id INT NULL,
  team_side VARCHAR(20) NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  hero_id INT NULL,
  action_order INT NULL,
  phase_index INT NULL,
  phase_label VARCHAR(255) NULL,
  slot_index INT NULL,
  locked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_draft_actions_session FOREIGN KEY (draft_session_id) REFERENCES draft_sessions(id) ON DELETE SET NULL,
  CONSTRAINT fk_draft_actions_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_draft_actions_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS overlay_settings (
  overlay_key VARCHAR(100) PRIMARY KEY,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO overlay_settings (overlay_key, is_enabled)
VALUES ('game_overlay', 1), ('loading_overlay', 1)
ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled);
