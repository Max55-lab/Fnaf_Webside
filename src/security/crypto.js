/* ============================================================
   WEB CRYPTO — password hashing + constant-time compares
   Passwords are salted and stretched with PBKDF2 (SHA-256);
   only { salt, hash, iterations } ever reaches storage. The
   oversight implant is verified by hashing the input and
   comparing against a stored digest, so the plaintext never
   appears in the bundle.

   Requires a secure context (https or file://). When crypto.subtle
   is missing, callers get a clean false from subtleAvailable()
   and can refuse account features without crashing.
   ============================================================ */

const ITERATIONS = 310000;
const HASH_BITS = 256;

export function subtleAvailable() {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.deriveBits === "function"
  );
}

function bufToHex(buf) {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return bufToHex(buf);
}

/* Constant-time string compare — walks both inputs fully so a
   mismatching prefix does not leak timing. */
export function constantTimeEqual(a, b) {
  const x = String(a ?? "");
  const y = String(b ?? "");
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i += 1) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(String(text ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufToHex(digest);
}

export async function hashPassword(password, saltHex) {
  if (!subtleAvailable()) {
    throw new Error("Web Crypto unavailable — insecure context");
  }
  const salt = saltHex || randomHex(16);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(password ?? "")),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(salt), iterations: ITERATIONS },
    key,
    HASH_BITS
  );
  return { salt, hash: bufToHex(bits), iterations: ITERATIONS };
}

export async function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  if (!subtleAvailable()) return false;
  const derived = await hashPassword(password, record.salt);
  return constantTimeEqual(derived.hash, record.hash);
}
