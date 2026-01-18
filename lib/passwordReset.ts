import crypto from "crypto";

const DEFAULT_TTL_MINUTES = 60;

export function generateResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getResetExpiry(now: Date = new Date()) {
  const raw = Number.parseInt(process.env.RESET_PASSWORD_TTL_MINUTES || "", 10);
  const ttlMinutes = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_MINUTES;
  return new Date(now.getTime() + ttlMinutes * 60 * 1000);
}

export function getResetBaseUrl(requestUrl: string) {
  const configured = (process.env.APP_BASE_URL || "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  return new URL(requestUrl).origin;
}
