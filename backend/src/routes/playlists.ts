import { Router } from "express";
import { query } from "../db";

const router = Router();

// GET /api/playlists — list playlists (with song counts)
router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.description, p.cover_url, p.created_at,
              COUNT(ps.song_id)::int AS song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       GROUP BY p.id
       ORDER BY p.id`
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error("list playlists error", err);
    return res.status(500).json({ error: "Failed to list playlists" });
  }
});

// GET /api/playlists/:id — playlist + ordered tracks
router.get("/:id", async (req, res) => {
  try {
    const pl = await query(
      `SELECT id, name, description, cover_url, created_at
       FROM playlists WHERE id = $1`,
      [req.params.id]
    );
    if (!pl.rows[0]) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const tracks = await query(
      `SELECT s.id, s.title, s.artist, s.album, s.duration_seconds,
              s.cover_url, s.audio_url, s.genre, ps.position
       FROM playlist_songs ps
       JOIN songs s ON s.id = ps.song_id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position, s.id`,
      [req.params.id]
    );
    return res.json({ data: { ...pl.rows[0], tracks: tracks.rows } });
  } catch (err) {
    console.error("get playlist error", err);
    return res.status(500).json({ error: "Failed to load playlist" });
  }
});

// POST /api/playlists — create playlist
router.post("/", async (req, res) => {
  const { name, description, coverUrl } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const result = await query(
      `INSERT INTO playlists (name, description, cover_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, cover_url, created_at`,
      [
        String(name).trim(),
        description || "",
        coverUrl || `https://picsum.photos/seed/${encodeURIComponent(name)}/400`,
      ]
    );
    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("create playlist error", err);
    return res.status(500).json({ error: "Failed to create playlist" });
  }
});

// POST /api/playlists/:id/songs — add song to playlist
router.post("/:id/songs", async (req, res) => {
  const { songId } = req.body || {};
  if (!songId) {
    return res.status(400).json({ error: "songId is required" });
  }
  try {
    const pl = await query("SELECT id FROM playlists WHERE id = $1", [
      req.params.id,
    ]);
    if (!pl.rows[0]) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const song = await query("SELECT id FROM songs WHERE id = $1", [songId]);
    if (!song.rows[0]) {
      return res.status(404).json({ error: "Song not found" });
    }
    const pos = await query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next FROM playlist_songs WHERE playlist_id = $1",
      [req.params.id]
    );
    await query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (playlist_id, song_id) DO NOTHING`,
      [req.params.id, songId, pos.rows[0].next]
    );
    return res.status(201).json({ data: { playlistId: Number(req.params.id), songId } });
  } catch (err) {
    console.error("add song error", err);
    return res.status(500).json({ error: "Failed to add song" });
  }
});

// DELETE /api/playlists/:id/songs/:songId — remove song from playlist
router.delete("/:id/songs/:songId", async (req, res) => {
  try {
    await query(
      "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      [req.params.id, req.params.songId]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error("remove song error", err);
    return res.status(500).json({ error: "Failed to remove song" });
  }
});

// DELETE /api/playlists/:id — delete playlist
router.delete("/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM playlists WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("delete playlist error", err);
    return res.status(500).json({ error: "Failed to delete playlist" });
  }
});

export default router;
