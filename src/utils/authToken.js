const crypto = require("crypto");

const SECRET = process.env.SESSION_SECRET || "dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const full = padded + "=".repeat(padLen);
  return Buffer.from(full, "base64");
}

function sign(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest();
}

function createToken(payload) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = { ...payload, exp };
  const bodyB64 = base64UrlEncode(JSON.stringify(body));
  const sigB64 = base64UrlEncode(sign(bodyB64));
  return `${bodyB64}.${sigB64}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [bodyB64, sigB64] = parts;
  const expected = base64UrlEncode(sign(bodyB64));
  if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected))) return null;

  try {
    const bodyJson = base64UrlDecode(bodyB64).toString("utf8");
    const payload = JSON.parse(bodyJson);
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = { createToken, verifyToken };
