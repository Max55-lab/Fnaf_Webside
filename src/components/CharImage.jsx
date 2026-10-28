import { useState } from "react";

/**
 * Character portrait with automatic fallback:
 * tries the wiki image first; if it fails to load, shows the emoji instead.
 */
export default function CharImage({
  char,
  emoji,
  className = "",
  style = {},
  width = 400,
  height = 560,
}) {
  const [failed, setFailed] = useState(!char.image);

  if (failed) {
    return (
      <span className={className} style={style} aria-hidden="true">
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={char.image}
      alt={char.name}
      className={className}
      style={{ objectFit: "cover", ...style }}
      width={width}
      height={height}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
