import { Pool } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

// If DATABASE_URL looks like a Railway reference variable (unresolved), treat as missing
const isRailwayRef = !!(connectionString && (connectionString.includes("${{") || connectionString.includes("{{")));

// Enable SSL for managed cloud Postgres (RDS, Render, Neon, etc.)
const needsSsl =
  !!connectionString &&
  !isRailwayRef &&
  /(amazonaws\.com|rds\.|render\.com|neon\.tech|supabase\.co|heroku)/i.test(connectionString);

export const pool = new Pool(
  connectionString && !isRailwayRef
    ? { connectionString, ssl: needsSsl ? { rejectUnauthorized: false } : false }
    : { connectionString: undefined },
);

pool.on("error", (err) => {
  console.error("[db] pool error:", err.message);
});

export async function query<T extends Record<string, any> = any>(text: string, params?: any[]) {
  return pool.query<T>(text, params);
}

export async function initSchema(): Promise<void> {
  if (isRailwayRef) {
    console.warn("[db] DATABASE_URL is an unresolved Railway reference - skipping schema init");
    return;
  }
  if (!connectionString) {
    console.warn("[db] DATABASE_URL not set - skipping schema init");
    return;
  }
  const candidates = [
    path.resolve(__dirname, "../../database/schema.sql"),
    path.resolve(__dirname, "../database/schema.sql"),
    path.resolve(process.cwd(), "database/schema.sql"),
    path.resolve(process.cwd(), "../database/schema.sql"),
  ];
  const schemaPath = candidates.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    console.warn("[db] schema.sql not found - skipping auto-init");
    return;
  }
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log("[db] schema applied from " + schemaPath);
}
