// Resolve wiki artwork.
// During a normal build these point at public/art and public/characters.
// The standalone builder injects data-URI maps before the app bundle, so the
// same calls keep working inside a single offline HTML file.

const base = import.meta.env.BASE_URL;

export const art = (name) =>
  globalThis.__FNAF_ART__?.[`${name}.webp`] ?? `${base}art/${name}.webp`;

export const characterArt = (id) =>
  globalThis.__FNAF_IMAGES__?.[id] ?? `${base}characters/${id}.webp`;

// Jumpscare scream clips (public/sfx/). `file` includes its extension, since
// the gallery serves .ogg for most characters and .wav for a few.
export const sfx = (file) =>
  globalThis.__FNAF_SFX__?.[file] ?? `${base}sfx/${file}`;
