import { useId, useState } from "react";

/**
 * Accessible, collapsible spoiler. The content is removed from the DOM until
 * the visitor explicitly reveals it, so screen-reader users do not get spoiled
 * by a visually hidden but still focusable passage.
 */
export default function Spoiler({
  label = "Reveal spoiler",
  hideLabel = "Hide spoiler",
  children,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={`spoiler ${open ? "is-open" : ""} ${className}`}>
      <button
        type="button"
        className="spoiler-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="spoiler-icon" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        <span>{open ? hideLabel : label}</span>
      </button>
      {open && (
        <div className="spoiler-body" id={id}>
          {children}
          <button
            type="button"
            className="spoiler-hide"
            onClick={() => setOpen(false)}
          >
            {hideLabel}
          </button>
        </div>
      )}
    </div>
  );
}
