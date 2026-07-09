import "dotenv/config";
import express from "express";
import cors from "cors";
import { initSchema, pool } from "./db";
import authRoutes from "./routes/auth";
import songRoutes from "./routes/songs";
import playlistRoutes from "./routes/playlists";
import artistRoutes from "./routes/artists";

const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

app.use(cors());
app.use(express.json());

// Health check — always returns 200 so Railway considers the service healthy.
// DB connectivity is checked separately and reported in the response body.
app.get("/health", async (_req, res) => {
  let db: "up" | "down" | "unconfigured" = "unconfigured";
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("${{")) {
      await pool.query("SELECT 1");
      db = "up";
    }
  } catch {
    db = "down";
  }
  res.status(200).json({ status: "ok", db, timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ service: "spotify-clone-backend", version: "1.0.0" });
});

// Auth
app.use("/auth", authRoutes);

// Domain API
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/artists", artistRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

async function start() {
  try {
    await initSchema();
  } catch (err) {
    console.error("[startup] schema init failed:", err);
  }
  app.listen(PORT, () => {
    console.log(`[spotify-clone-backend] listening on port ${PORT}`);
  });
}

start();

export default app;
