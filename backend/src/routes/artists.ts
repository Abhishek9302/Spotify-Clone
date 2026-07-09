import { Router } from "express";
import { query } from "../db";

const router = Router();

// GET /api/artists — list artists (with song counts)
router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT a.id, a.name, a.bio, a.image_url,
              (SELECT COUNT(*)::int FROM songs s WHERE s.artist = a.name) AS song_count
       FROM artists a
       ORDER BY a.name`
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error("list artists error", err);
    return res.status(500).json({ error: "Failed to list artists" });
  }
});

// GET /api/artists/:id — artist + their songs
router.get("/:id", async (req, res) => {
  try {
    const artist = await query(
      "SELECT id, name, bio, image_url FROM artists WHERE id = $1",
      [req.params.id]
    );
    if (!artist.rows[0]) {
      return res.status(404).json({ error: "Artist not found" });
    }
    const songs = await query(
      `SELECT id, title, artist, album, duration_seconds, cover_url, audio_url, genre
       FROM songs WHERE artist = $1 ORDER BY album, title`,
      [artist.rows[0].name]
    );
    return res.json({ data: { ...artist.rows[0], songs: songs.rows } });
  } catch (err) {
    console.error("get artist error", err);
    return res.status(500).json({ error: "Failed to load artist" });
  }
});

export default router;
