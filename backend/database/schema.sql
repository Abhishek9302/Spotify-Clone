-- ABH-7 Spotify Clone schema + seed data
-- Auto-applied by the deploy pipeline.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artists (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  bio       TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS songs (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  artist           TEXT NOT NULL,
  album            TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  cover_url        TEXT NOT NULL DEFAULT '',
  audio_url        TEXT NOT NULL DEFAULT '',
  genre            TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS playlists (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url   TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id     INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_songs_title ON songs (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs (LOWER(artist));
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs (playlist_id);

-- ---------------------------------------------------------------------------
-- Seed data (idempotent: only inserts when tables are empty)
-- ---------------------------------------------------------------------------

INSERT INTO artists (name, bio, image_url)
SELECT * FROM (VALUES
  ('Nova Waves',   'Synthwave producer crafting neon-lit soundscapes.',       'https://picsum.photos/seed/nova/400'),
  ('Echo Vale',    'Indie-pop duo blending dreamy vocals and warm guitars.',  'https://picsum.photos/seed/echo/400'),
  ('Crimson Fox',  'Alt-rock band with anthemic hooks and gritty energy.',    'https://picsum.photos/seed/crimson/400'),
  ('Luna Sol',     'Electronic artist mixing ambient textures and house.',    'https://picsum.photos/seed/luna/400'),
  ('The Meridian', 'Jazz-fusion collective from the late-night circuit.',     'https://picsum.photos/seed/meridian/400')
) AS v(name, bio, image_url)
WHERE NOT EXISTS (SELECT 1 FROM artists);

INSERT INTO songs (title, artist, album, duration_seconds, cover_url, audio_url, genre)
SELECT * FROM (VALUES
  ('Neon Horizon',       'Nova Waves',   'Midnight Drive',   214, 'https://picsum.photos/seed/s1/300',  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Synthwave'),
  ('Electric Dreams',    'Nova Waves',   'Midnight Drive',   198, 'https://picsum.photos/seed/s2/300',  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Synthwave'),
  ('Retrograde',         'Nova Waves',   'Afterglow',        232, 'https://picsum.photos/seed/s3/300',  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Synthwave'),
  ('Chrome City',        'Nova Waves',   'Afterglow',        205, 'https://picsum.photos/seed/s4/300',  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Synthwave'),
  ('Paper Hearts',       'Echo Vale',    'Soft Focus',       187, 'https://picsum.photos/seed/s5/300',  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Indie Pop'),
  ('Golden Hour',        'Echo Vale',    'Soft Focus',       201, 'https://picsum.photos/seed/s6/300',  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Indie Pop'),
  ('Slow Motion',        'Echo Vale',    'Soft Focus',       223, 'https://picsum.photos/seed/s7/300',  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Indie Pop'),
  ('Daydreamer',         'Echo Vale',    'Bloom',            176, 'https://picsum.photos/seed/s8/300',  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Indie Pop'),
  ('Wildfire',           'Crimson Fox',  'Ignite',           245, 'https://picsum.photos/seed/s9/300',  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Alt Rock'),
  ('Break the Silence',  'Crimson Fox',  'Ignite',           238, 'https://picsum.photos/seed/s10/300', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Alt Rock'),
  ('Concrete Sky',       'Crimson Fox',  'Ignite',           219, 'https://picsum.photos/seed/s11/300', 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Alt Rock'),
  ('Hollow Ground',      'Crimson Fox',  'Aftershock',       256, 'https://picsum.photos/seed/s12/300', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Alt Rock'),
  ('Moonlit Bass',       'Luna Sol',     'Nocturne',         269, 'https://picsum.photos/seed/s13/300', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Electronic'),
  ('Deep End',           'Luna Sol',     'Nocturne',         241, 'https://picsum.photos/seed/s14/300', 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Electronic'),
  ('Aurora',             'Luna Sol',     'Nocturne',         228, 'https://picsum.photos/seed/s15/300', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Electronic'),
  ('Submerge',           'Luna Sol',     'Tidal',            212, 'https://picsum.photos/seed/s16/300', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Electronic'),
  ('Midnight Express',   'The Meridian', 'Late Set',         294, 'https://picsum.photos/seed/s17/300', 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Jazz Fusion'),
  ('Blue Note Avenue',   'The Meridian', 'Late Set',         278, 'https://picsum.photos/seed/s18/300', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', 'Jazz Fusion'),
  ('Velvet Room',        'The Meridian', 'Encore',           263, 'https://picsum.photos/seed/s19/300', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 'Jazz Fusion'),
  ('After Hours',        'The Meridian', 'Encore',           251, 'https://picsum.photos/seed/s20/300', 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3', 'Jazz Fusion')
) AS v(title, artist, album, duration_seconds, cover_url, audio_url, genre)
WHERE NOT EXISTS (SELECT 1 FROM songs);

INSERT INTO playlists (name, description, cover_url)
SELECT * FROM (VALUES
  ('Neon Nights',    'Synthwave and electronic cuts for after dark.', 'https://picsum.photos/seed/pl1/400'),
  ('Indie Chill',    'Warm, dreamy indie-pop to unwind to.',          'https://picsum.photos/seed/pl2/400'),
  ('Rock Anthems',   'High-energy alt-rock hits.',                    'https://picsum.photos/seed/pl3/400')
) AS v(name, description, cover_url)
WHERE NOT EXISTS (SELECT 1 FROM playlists);

-- Neon Nights -> synthwave + electronic songs
INSERT INTO playlist_songs (playlist_id, song_id, position)
SELECT p.id, s.id, ROW_NUMBER() OVER (ORDER BY s.id)
FROM playlists p
JOIN songs s ON s.genre IN ('Synthwave', 'Electronic')
WHERE p.name = 'Neon Nights'
  AND NOT EXISTS (SELECT 1 FROM playlist_songs ps WHERE ps.playlist_id = p.id);

-- Indie Chill -> indie pop songs
INSERT INTO playlist_songs (playlist_id, song_id, position)
SELECT p.id, s.id, ROW_NUMBER() OVER (ORDER BY s.id)
FROM playlists p
JOIN songs s ON s.genre = 'Indie Pop'
WHERE p.name = 'Indie Chill'
  AND NOT EXISTS (SELECT 1 FROM playlist_songs ps WHERE ps.playlist_id = p.id);

-- Rock Anthems -> alt rock songs
INSERT INTO playlist_songs (playlist_id, song_id, position)
SELECT p.id, s.id, ROW_NUMBER() OVER (ORDER BY s.id)
FROM playlists p
JOIN songs s ON s.genre = 'Alt Rock'
WHERE p.name = 'Rock Anthems'
  AND NOT EXISTS (SELECT 1 FROM playlist_songs ps WHERE ps.playlist_id = p.id);
