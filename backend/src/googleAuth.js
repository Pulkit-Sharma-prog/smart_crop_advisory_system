import { createPublicKey, createVerify } from "node:crypto";
import { backendEnv } from "./env.js";

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";

let cachedKeys = null;
let cacheExpiresAtMs = 0;

export class GoogleAuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "GoogleAuthError";
    this.statusCode = statusCode;
  }
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function parseJwt(idToken) {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new GoogleAuthError("Malformed Google ID token", 401);
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new GoogleAuthError("Invalid token payload", 401);
  }

  return {
    header,
    payload,
    signature: signatureB64,
    signingInput: `${headerB64}.${payloadB64}`,
  };
}

function parseCacheControlMaxAge(cacheControlHeader) {
  if (!cacheControlHeader) return 300;
  const match = cacheControlHeader.match(/max-age=(\d+)/i);
  if (!match) return 300;
  const maxAge = Number.parseInt(match[1], 10);
  return Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 300;
}

async function getGoogleCertKeys() {
  const now = Date.now();
  if (cachedKeys && now < cacheExpiresAtMs) {
    return cachedKeys;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new GoogleAuthError("Unable to fetch Google signing certificates", 503);
  }

  const body = await response.json();
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  if (keys.length === 0) {
    throw new GoogleAuthError("Google signing certificates are unavailable", 503);
  }

  const maxAgeSeconds = parseCacheControlMaxAge(response.headers.get("cache-control"));
  cachedKeys = keys;
  cacheExpiresAtMs = now + maxAgeSeconds * 1000;

  return keys;
}

function hasValidAudience(audClaim, expectedAudience) {
  if (typeof audClaim === "string") {
    return audClaim === expectedAudience;
  }

  if (Array.isArray(audClaim)) {
    return audClaim.includes(expectedAudience);
  }

  return false;
}

function verifySignature(signingInput, signatureB64, keyJwk) {
  const verifier = createVerify("RSA-SHA256");
  verifier.update(signingInput);
  verifier.end();

  const signature = Buffer.from(
    signatureB64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(signatureB64.length / 4) * 4, "="),
    "base64",
  );
  const publicKey = createPublicKey({ key: keyJwk, format: "jwk" });

  return verifier.verify(publicKey, signature);
}

export async function verifyGoogleIdToken(idToken) {
  if (!backendEnv.googleClientId) {
    throw new GoogleAuthError("Google sign-in is not configured on backend", 503);
  }

  const token = parseJwt(idToken);
  if (token.header?.alg !== "RS256" || typeof token.header?.kid !== "string") {
    throw new GoogleAuthError("Unsupported Google token header", 401);
  }

  const keys = await getGoogleCertKeys();
  const signingKey = keys.find((key) => key?.kid === token.header.kid && key?.kty === "RSA");
  if (!signingKey) {
    throw new GoogleAuthError("Google signing key not found for token", 401);
  }

  const signatureValid = verifySignature(token.signingInput, token.signature, signingKey);
  if (!signatureValid) {
    throw new GoogleAuthError("Invalid Google token signature", 401);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = token.payload ?? {};
  if (!GOOGLE_ISSUERS.has(payload.iss)) {
    throw new GoogleAuthError("Invalid Google token issuer", 401);
  }

  if (!hasValidAudience(payload.aud, backendEnv.googleClientId)) {
    throw new GoogleAuthError("Google token audience mismatch", 401);
  }

  if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) {
    throw new GoogleAuthError("Google token expired", 401);
  }

  if (typeof payload.iat === "number" && payload.iat > nowSeconds + 60) {
    throw new GoogleAuthError("Google token issued-at time is invalid", 401);
  }

  if (payload.email_verified !== true) {
    throw new GoogleAuthError("Google account email is not verified", 403);
  }

  return {
    id: String(payload.sub ?? ""),
    email: String(payload.email ?? ""),
    name: typeof payload.name === "string" ? payload.name : "",
    picture: typeof payload.picture === "string" ? payload.picture : "",
    provider: "google",
  };
}
