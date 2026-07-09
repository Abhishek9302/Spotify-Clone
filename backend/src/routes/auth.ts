import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db";
import { signToken, requireAuth, AuthedRequest } from "../auth";

const router = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, display_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email, displayName || email.split("@")[0], hash]
    );
    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ error: "Signup failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const result = await query(
      "SELECT id, email, display_name, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email, display_name: user.display_name },
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await query(
      "SELECT id, email, display_name FROM users WHERE id = $1",
      [req.user!.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("me error", err);
    return res.status(500).json({ error: "Failed to load user" });
  }
});

export default router;
