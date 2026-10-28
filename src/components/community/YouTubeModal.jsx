import { useEffect, useRef } from "react";

export default function YouTubeModal({ video, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  if (!video) return null;

  return (
    <div className="video-modal-backdrop" onMouseDown={onClose}>
      <div
        className="video-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="video-modal-head">
          <div>
            <span className="video-modal-kicker">{video.source} · YouTube</span>
            <h2 id="video-modal-title">{video.title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="video-modal-close"
            onClick={onClose}
            aria-label="Close video"
          >
            ✕
          </button>
        </div>

        <div className="video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="video-modal-foot">
          <span>Third-party embed. Creator opinions are not canon.</span>
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            Watch on YouTube ↗
          </a>
        </div>
      </div>
    </div>
  );
}
