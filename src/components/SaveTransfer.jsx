import { useRef, useState } from "react";
import {
  exportBase64,
  exportJson,
  importSaveFromText,
} from "../lib/saveState.js";
import { offloadMode } from "../lib/offload.js";

/* ============================================================
   SAVE TRANSFER PANEL — export / import your wiki night
   Everything stays local: export copies a JSON/Base64 blob to
   you, import pastes one back. No network, no telemetry.
   ============================================================ */
export default function SaveTransfer() {
  const [out, setOut] = useState("");
  const [outKind, setOutKind] = useState("json");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { kind: "ok"|"bad", text }
  const [paste, setPaste] = useState("");
  const outRef = useRef(null);

  /* Lazily probed: no worker has run at mount, so this reads "main"
     until the first export/import proves otherwise (see doExport). */
  const [mode, setMode] = useState(() => offloadMode());

  const run = async (fn) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      setNotice({ kind: "bad", text: `Export failed: ${String(err?.message || err)}` });
    } finally {
      setBusy(false);
    }
  };

  const doExport = (kind) =>
    run(async () => {
      const text = kind === "base64" ? await exportBase64() : await exportJson();
      setMode(offloadMode()); // reflect the mode the export actually used
      setOutKind(kind);
      setOut(text);
      setNotice({
        kind: "ok",
        text: `Save generated (${kind.toUpperCase()}, ${Math.round(text.length / 1024)} KB) — copy it or download the JSON file.`,
      });
    });

  const copyOut = async () => {
    try {
      await navigator.clipboard.writeText(out);
      setNotice({ kind: "ok", text: "Copied to clipboard." });
    } catch {
      /* Clipboard blocked — select the box so Ctrl+C still works. */
      if (outRef.current) {
        outRef.current.focus();
        outRef.current.select();
      }
      setNotice({ kind: "bad", text: "Clipboard unavailable — the text is selected, copy manually." });
    }
  };

  const downloadOut = () => {
    const blob = new Blob([out], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fnaf-wiki-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice({ kind: "ok", text: "Save file downloaded." });
  };

  const doImport = async () => {
    if (
      !window.confirm(
        "Import this save? Current local data for keys present in the save will be replaced. The page reloads afterwards."
      )
    ) {
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const result = await importSaveFromText(paste);
      if (!result.ok) {
        setNotice({ kind: "bad", text: result.error });
        return;
      }
      setNotice({
        kind: "ok",
        text: `Import applied (${result.applied} entries). Reloading the shift…`,
      });
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setNotice({ kind: "bad", text: `Import failed: ${String(err?.message || err)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="st-title">
      <div className="sr-section-head">
        <span className="hub-kicker">Backup &amp; restore</span>
        <h2 id="st-title" className="sr-section-title">
          Save file
        </h2>
      </div>
      <p className="card-text">
        Your secrets, badges, forum posts, chat and scores live in this browser only.
        Export them as JSON (readable) or Base64 (compact), keep the file somewhere safe,
        and import it back on this or any other device. Encode mode:{" "}
        <strong>{mode === "worker" ? "web worker" : "main thread"}</strong>.
      </p>

      <div className="st-actions">
        <button type="button" className="btn" onClick={() => doExport("json")} disabled={busy}>
          Export JSON
        </button>
        <button type="button" className="btn" onClick={() => doExport("base64")} disabled={busy}>
          Export Base64
        </button>
        <button type="button" className="btn" onClick={copyOut} disabled={!out || busy}>
          Copy
        </button>
        <button type="button" className="btn" onClick={downloadOut} disabled={!out || busy}>
          Download .json
        </button>
      </div>

      {out && (
        <textarea
          className="st-box"
          ref={outRef}
          readOnly
          rows={6}
          value={out}
          aria-label={`Exported save (${outKind})`}
          onFocus={(event) => event.target.select()}
        />
      )}

      <div className="st-import">
        <label className="field field-wide" htmlFor="st-import-box">
          <span>Import — paste a JSON or Base64 save</span>
          <textarea
            id="st-import-box"
            className="st-box"
            rows={4}
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={'{"app":"fnaf-wiki","version":1,…} or the Base64 blob'}
          />
        </label>
        <button
          type="button"
          className="btn btn-danger"
          onClick={doImport}
          disabled={!paste.trim() || busy}
        >
          Import save
        </button>
      </div>

      {notice && (
        <p
          className={notice.kind === "ok" ? "st-notice-ok" : "st-notice-bad"}
          role="status"
        >
          {notice.text}
        </p>
      )}
    </section>
  );
}
