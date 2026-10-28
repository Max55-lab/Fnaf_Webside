import { useSettings } from "./Layout.jsx";

/**
 * Persistent save control. Bookmarks are stored with the rest of the visitor's
 * preferences so they survive refreshes and work in the standalone build.
 */
export default function BookmarkButton({
  kind,
  id,
  label,
  to,
  compact = false,
  className = "",
}) {
  const { bookmarks, toggleBookmark } = useSettings();
  const saved = bookmarks.some((item) => item.kind === kind && item.id === id);

  return (
    <button
      type="button"
      className={`bookmark-btn ${saved ? "is-saved" : ""} ${compact ? "is-compact" : ""} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved items` : `Save ${label}`}
      onClick={() => toggleBookmark({ kind, id, label, to })}
    >
      <span className="bookmark-star" aria-hidden="true">
        {saved ? "★" : "☆"}
      </span>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
