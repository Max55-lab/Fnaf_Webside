/* ============================================================
   SAVE STATE — Base64 / JSON export + import
   One-click backup of everything this wiki remembers about you:
   secrets, badges & progress, forum posts, break-room chat,
   arcade scores, bookmarks, prefs — every fnaf_* localStorage
   key — plus the IndexedDB `kv` store (future modules land there).

   Deliberately excluded:
   - fnaf_lockout_v1   (security backoff — must not travel)
   - fnaf_idb::*       (IDB mirrors; kv is exported properly)
   - accounts/audit    (credentials + audit trail stay per-device)

   JSON is the human-readable format; Base64 wraps the same JSON
   for copy-paste. Both are produced through the save worker with
   a main-thread fallback, so huge saves never jank the UI.
   ============================================================ */

import { idbAll, idbPut } from "./db.js";
import { offloadEncode, offloadDecode } from "./offload.js";

export const SAVE_APP = "fnaf-wiki";
export const SAVE_VERSION = 1;

const SKIP_LOCAL = new Set(["fnaf_lockout_v1"]);

function localEntries() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("fnaf_")) continue;
      if (key.startsWith("fnaf_idb::") || SKIP_LOCAL.has(key)) continue;
      out[key] = localStorage.getItem(key);
    }
  } catch {
    /* storage unavailable — caller gets an empty save, not a crash */
  }
  return out;
}

export async function collectSave() {
  let kv = [];
  try {
    kv = await idbAll("kv");
  } catch {
    kv = [];
  }
  return {
    app: SAVE_APP,
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    local: localEntries(),
    kv,
  };
}

export async function exportJson() {
  return JSON.stringify(await collectSave(), null, 2);
}

export async function exportBase64() {
  return offloadEncode(await collectSave());
}

/* Accepts pretty JSON or the Base64 blob interchangeably. */
export async function importSaveFromText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return { ok: false, error: "Nothing pasted — export a save first." };

  let data;
  try {
    data = trimmed.startsWith("{") ? JSON.parse(trimmed) : await offloadDecode(trimmed);
  } catch {
    return { ok: false, error: "Could not parse that — paste the JSON or Base64 from the export panel." };
  }

  if (!data || typeof data !== "object" || data.app !== SAVE_APP) {
    return { ok: false, error: "Not a FNAF Wiki save file." };
  }
  if (typeof data.version !== "number" || data.version > SAVE_VERSION) {
    return { ok: false, error: "This save is from a newer wiki build — update before importing." };
  }

  let applied = 0;
  const local = data.local && typeof data.local === "object" ? data.local : {};
  for (const [key, value] of Object.entries(local)) {
    if (!key.startsWith("fnaf_") || SKIP_LOCAL.has(key) || typeof value !== "string") continue;
    try {
      localStorage.setItem(key, value);
      applied += 1;
    } catch {
      /* quota — keep applying the rest */
    }
  }

  const kv = Array.isArray(data.kv) ? data.kv : [];
  for (const entry of kv) {
    if (!entry || typeof entry !== "object" || !("k" in entry)) continue;
    try {
      await idbPut("kv", entry);
      applied += 1;
    } catch {
      /* quota — keep applying the rest */
    }
  }

  return { ok: true, applied };
}
