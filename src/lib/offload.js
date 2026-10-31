/* ============================================================
   WORKER OFFLOAD — save codec with a main-thread fallback
   The heavy base64/JSON work for save export/import is pushed to
   an inline Web Worker (?worker&inline -> blob: URL, so the
   single-file build has no external worker file and file:// works
   where blob workers are allowed).

   Guarantees for callers:
   - always resolves/rejects as a Promise
   - a worker that never answers (blocked by the engine, dead blob
     URL) falls back to the same code on the main thread after a
     short timeout — the UI never hangs.
   ============================================================ */

import SaveWorker from "../workers/save.worker.js?worker&inline";

const TIMEOUT_MS = 4000;

let worker = null; // null = untried, false = unavailable
let seq = 0;
const pending = new Map();

/* --- main-thread twins of the worker ops (also the fallback) --- */
function encodeSync(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function decodeSync(b64) {
  const binary = atob(String(b64 || "").trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function settle(id, ok, value, error) {
  const entry = drop(id);
  if (!entry) return;
  if (ok) entry.resolve(value);
  else entry.reject(new Error(error || "worker failed"));
}

/* Remove a pending entry (clearing its timeout). */
function drop(id) {
  const entry = pending.get(id);
  pending.delete(id);
  if (entry) clearTimeout(entry.timer);
  return entry;
}

function ensureWorker() {
  if (worker !== null) return worker;
  if (typeof Worker === "undefined" || typeof Blob === "undefined") {
    worker = false;
    return worker;
  }
  try {
    worker = new SaveWorker();
    worker.onmessage = (event) => {
      const { id, ok, data, error } = event.data || {};
      settle(id, ok, data, error);
    };
    worker.onerror = () => {
      /* Engine refused the worker (e.g. blob URLs off) — every
         in-flight call finishes on the main thread instead of
         failing, and later calls skip the worker entirely. */
      worker = false;
      for (const [id] of [...pending.keys()]) {
        const entry = drop(id);
        try {
          entry.resolve(entry.sync());
        } catch (err) {
          entry.reject(err);
        }
      }
    };
  } catch {
    worker = false;
  }
  return worker;
}

function dispatch(op, payload) {
  const w = ensureWorker();
  const sync = () => (op === "encode" ? encodeSync(payload) : decodeSync(payload));
  if (!w) return Promise.resolve().then(sync);
  const id = (seq += 1);
  return new Promise((resolve, reject) => {
    /* On timeout or crash the same work runs on the main thread —
       callers always get an answer, never a hang. */
    const finishSync = () => {
      try {
        resolve(sync());
      } catch (err) {
        reject(err);
      }
    };
    const timer = setTimeout(() => {
      drop(id);
      finishSync();
    }, TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer, sync });
    try {
      w.postMessage({ id, op, payload });
    } catch {
      drop(id);
      finishSync();
    }
  });
}

export function offloadEncode(obj) {
  return dispatch("encode", obj);
}

export function offloadDecode(b64) {
  return dispatch("decode", b64);
}

/* Diagnostics for the save panel: "worker" | "main". */
export function offloadMode() {
  return worker instanceof Worker ? "worker" : "main";
}
