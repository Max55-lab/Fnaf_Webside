/* Save codec worker — self-contained on purpose (no imports) so it
   can be bundled inline via ?worker&inline and still run from a
   blob: URL in the single-file build. Handles:
     op "encode" : plain object -> base64 string (UTF-8 safe)
     op "decode" : base64 string -> parsed object
   Every reply echoes the request id so the main thread can match. */
self.onmessage = (event) => {
  const { id, op, payload } = event.data || {};
  try {
    if (op === "encode") {
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      let binary = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      self.postMessage({ id, ok: true, data: btoa(binary) });
      return;
    }
    if (op === "decode") {
      const binary = atob(String(payload || "").trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      self.postMessage({ id, ok: true, data: JSON.parse(new TextDecoder().decode(bytes)) });
      return;
    }
    throw new Error(`unknown op: ${op}`);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
