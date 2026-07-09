import { Router } from "express";
import { query } from "../db";

const router = Router();

// GET /api/songs?limit=&offset=  — list all songs (paginated)
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);
  const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);
  try {
    const [rows, count] = await Promise.all([
      query(
        `SELECT id, title, artist, album, duration_seconds, cover_url, audio_url, genre
         FROM songs ORDER BY id LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query("SELECT COUNT(*)::int AS total FROM songs"),
    ]);
    return res.json({
      data: rows.rows,
      pagination: { limit, offset, total: count.rows[0].total },
    });
  } catch (err) {
    console.error("list songs error", err);
    return res.status(500).json({ error: "Failed to list songs" });
  }
});

// GET /api/songs/search?q= — search by title or artist
router.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.json({ data: [] });
  }
  try {
    const result = await query(
      `SELECT id, title, artist, album, duration_seconds, cover_url, audio_url, genre
       FROM songs
       WHERE LOWER(title) LIKE LOWER($1) OR LOWER(artist) LIKE LOWER($1) OR LOWER(album) LIKE LOWER($1)
       ORDER BY title LIMIT 50`,
      [`%${q}%`]
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error("search songs error", err);
    return res.status(500).json({ error: "Search failed" });
  }
});

// GET /api/songs/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, artist, album, duration_seconds, cover_url, audio_url, genre
       FROM songs WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Song not found" });
    }
    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("get song error", err);
    return res.status(500).json({ error: "Failed to load song" });
  }
});

export default router;
