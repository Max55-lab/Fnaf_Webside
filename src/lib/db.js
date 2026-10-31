/* ============================================================
   INDEXEDDB LAYER — fnaf_multiverse
   A tiny promise wrapper with an ordered migration registry, so
   later modules (news, gallery, drawings) add stores by pushing a
   new step instead of rewriting open logic.

   - QuotaExceededError is normalised + announced via a window event
     so UI can react (downscale art, warn the user).
   - If IndexedDB is unavailable (private mode, exotic file://
     browsers) every store transparently falls back to a
     localStorage mirror under fnaf_idb::<store>. The async API is
     identical either way.
   ============================================================ */

const DB_NAME = "fnaf_multiverse";
const DB_VERSION = 1;

/* Ordered migrations — a step runs when DB_VERSION increases, and every
   step must be idempotent (create-if-absent), because the opener also
   re-runs all steps to heal a half-created database: if a previous
   upgrade crashed (or an older build created the DB without stores),
   version-gated migrations alone would never repair the schema and
   every transaction would fail forever. Each step lists the stores it
   owns so the opener can detect what is missing. */
const MIGRATIONS = [
  {
    version: 1,
    stores: ["kv", "accounts", "audit"],
    migrate(db) {
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "k" });
      }
      if (!db.objectStoreNames.contains("accounts")) {
        db.createObjectStore("accounts", { keyPath: "handle" });
      }
      if (!db.objectStoreNames.contains("audit")) {
        db.createObjectStore("audit", { keyPath: "id", autoIncrement: true });
      }
    },
  },
];

function runMigrations(db) {
  for (const step of MIGRATIONS) {
    if (step.version <= DB_VERSION) step.migrate(db);
  }
}

function expectedStores() {
  return MIGRATIONS.filter((step) => step.version <= DB_VERSION).flatMap(
    (step) => step.stores || []
  );
}

/* ---------------- Quota plumbing ---------------- */
export function isQuotaError(err) {
  return Boolean(
    err &&
      (err.name === "QuotaExceededError" ||
        err.code === 22 ||
        /quota/i.test(String(err.message || "")))
  );
}

function reportQuota(err) {
  if (typeof window !== "undefined" && isQuotaError(err)) {
    window.dispatchEvent(
      new CustomEvent("fnaf:quota", { detail: { at: Date.now() } })
    );
  }
}

/* ---------------- Open + migrations ---------------- */
let dbPromise = null;
let fallbackMode = false;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      fallbackMode = true;
      resolve(null);
      return;
    }
    /* Open without a version so an existing newer DB can never throw
       VersionError; upgrades are driven explicitly below. */
    let request;
    try {
      request = indexedDB.open(DB_NAME);
    } catch {
      fallbackMode = true;
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      /* Fresh database — every idempotent step creates its stores. */
      runMigrations(request.result);
    };
    request.onsuccess = () => {
      const db = request.result;
      const missing = expectedStores().filter(
        (name) => !db.objectStoreNames.contains(name)
      );
      if (!missing.length) {
        db.onversionchange = () => db.close();
        resolve(db);
        return;
      }
      /* Half-created schema (crashed upgrade, older build): force a
         version bump so the idempotent steps re-run and rebuild every
         missing store instead of failing all transactions forever. */
      const nextVersion = Math.max(db.version, DB_VERSION) + 1;
      db.close();
      let upgrade;
      try {
        upgrade = indexedDB.open(DB_NAME, nextVersion);
      } catch {
        fallbackMode = true;
        resolve(null);
        return;
      }
      upgrade.onupgradeneeded = () => runMigrations(upgrade.result);
      upgrade.onsuccess = () => {
        const healed = upgrade.result;
        healed.onversionchange = () => healed.close();
        resolve(healed);
      };
      upgrade.onerror = () => {
        fallbackMode = true;
        resolve(null);
      };
      upgrade.onblocked = () => {
        fallbackMode = true;
        resolve(null);
      };
    };
    request.onerror = () => {
      /* Can happen under file:// in some engines — degrade, never crash. */
      fallbackMode = true;
      resolve(null);
    };
    request.onblocked = () => {
      fallbackMode = true;
      resolve(null);
    };
  });
  return dbPromise;
}

export function usingFallback() {
  return fallbackMode;
}

/* ---------------- localStorage mirror ---------------- */
/* Mirror mode must respect each store's keyPath (kv -> "k",
   accounts -> "handle") or keyed writes silently vanish. */
const MIRROR_KEYPATH = { kv: "k", accounts: "handle" };

function mirrorKeyPath(store) {
  return MIRROR_KEYPATH[store] || null;
}

function mirrorKey(store) {
  return `fnaf_idb::${store}`;
}

function mirrorRead(store) {
  try {
    const parsed = JSON.parse(localStorage.getItem(mirrorKey(store)) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function mirrorWrite(store, map) {
  try {
    localStorage.setItem(mirrorKey(store), JSON.stringify(map));
    return true;
  } catch (err) {
    reportQuota(err);
    return false;
  }
}

/* ---------------- Public API ---------------- */
export async function idbGet(store, key) {
  const db = await openDb();
  if (!db) {
    return mirrorRead(store)[String(key)] ?? null;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPut(store, value) {
  const db = await openDb();
  if (!db) {
    const map = mirrorRead(store);
    /* Mirror mode derives the key the way the real store's
       keyPath would: kv -> value.k, accounts -> value.handle,
       audit -> synthetic numeric id (autoIncrement). */
    const keyPath = mirrorKeyPath(store);
    let key = null;
    if (keyPath && value && value[keyPath] != null) {
      key = value[keyPath];
    } else if (store === "audit") {
      key = Date.now();
    }
    if (key == null) return value;
    map[key] = value;
    if (!mirrorWrite(store, map)) {
      const err = new Error("storage quota exceeded");
      err.name = "QuotaExceededError";
      throw err;
    }
    return value;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => {
      reportQuota(req.error);
      reject(req.error);
    };
  });
}

export async function idbAll(store) {
  const db = await openDb();
  if (!db) {
    return Object.values(mirrorRead(store));
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbDelete(store, key) {
  const db = await openDb();
  if (!db) {
    const map = mirrorRead(store);
    delete map[String(key)];
    mirrorWrite(store, map);
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------------- Audit trail ---------------- */
export async function logAudit(action, detail) {
  try {
    await idbPut("audit", {
      action: String(action).slice(0, 40),
      detail: String(detail ?? "").slice(0, 80),
      ts: new Date().toISOString(),
    });
  } catch {
    /* auditing must never break the UI */
  }
}
