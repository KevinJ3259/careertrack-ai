import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

type TokenPayload = {
  userId: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}
