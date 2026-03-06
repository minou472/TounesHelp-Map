import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// ── CREATE TOKENS ─────────────────────────────────────────────────────────────

export function createAccessToken(payload: {
    userId: string;
    role: string;
}) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function createRefreshToken(payload: {
    userId: string;
}) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

// ── VERIFY TOKENS ─────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string) {
    try {
    return jwt.verify(token, ACCESS_SECRET) as {
        userId: string;
        role: string;
    };
} catch {
    return null;
}
}
export function verifyRefreshToken(token: string) {
    try {
    return jwt.verify(token, REFRESH_SECRET) as {
        userId: string;
    };
} catch {
    return null;
}
}