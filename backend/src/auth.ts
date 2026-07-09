import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "abh7-spotify-dev-secret";

export interface AuthedRequest extends Request {
  user?: { id: number; email: string };
}

export function signToken(payload: { id: number; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
