// auth.ts – stub implementation for JWT based authentication
// This is an in‑memory placeholder (no DB) used for early prototyping.

import * as jwt from "jsonwebtoken";

// Secret key – in a real project this would come from .env
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export interface UserPayload {
    id: string;
    email: string;
    role?: string;
}

/**
 * Generate a signed JWT for a given user payload.
 */
export function generateToken(payload: UserPayload, expiresIn = "1h"): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws if verification fails.
 */
export function verifyToken(token: string): UserPayload {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
}

/**
 * Simple middleware for Express (or compatible) that validates the Authorization header.
 * If valid, attaches `req.user` with the decoded payload.
 */
export function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
