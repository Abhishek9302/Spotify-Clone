import { Pool } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

// Enable SSL automatically when talking to a managed Postgres (RDS/AWS/Heroku etc.)
const needsSsl =
  !!connectionString &&
  /(amazonaws\.com|rds\.|render\.com|neon\.tech|supabase\.co|heroku)/i.test(
    connectionString
  );

export const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export async function query<T extends Record<string, any> = any>(
  text: string,
  params?: any[]
) {
  return pool.query<T>(text, params);
}

/**
 * Apply database/schema.sql on boot so the app is self-provisioning.
 * Safe to run repeatedly — the schema uses CREATE TABLE IF NOT EXISTS and
 * idempotent seed inserts.
 */
export async function initSchema(): Promise<void> {
  const candidates = [
    path.resolve(__dirname, "../../database/schema.sql"),
    path.resolve(process.cwd(), "database/schema.sql"),
    path.resolve(process.cwd(), "../database/schema.sql"),
  ];
  const schemaPath = candidates.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    console.warn("[db] schema.sql not found; skipping auto-init");
    return;
  }
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log(`[db] schema applied from ${schemaPath}`);
}
