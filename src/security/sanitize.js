/* ============================================================
   UGC SANITISATION — DOMPurify at the storage boundary
   React escapes on render, so this is belt-and-braces: anything
   a user can type (forum posts, chat lines, handles, broadcast
   notices) is stripped of tags before it ever hits localStorage
   or IndexedDB, and any future rich field goes through
   sanitizeHtml() with a tight allow-list.
   ============================================================ */

import DOMPurify from "dompurify";

/* Plain-text fields: strip every tag, keep the text content. */
export function sanitizeText(value, max = 4000) {
  const raw = String(value ?? "");
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
    .trim()
    .slice(0, max);
}

/* Rich fields (future modules): small allow-list, no attributes
   beyond safe link targets. javascript: URLs are dropped by
   DOMPurify's default URI regex; rel/target are forced sane. */
export function sanitizeHtml(value, max = 10000) {
  const clean = DOMPurify.sanitize(String(value ?? "").slice(0, max), {
    ALLOWED_TAGS: [
      "b", "strong", "i", "em", "u", "s", "a", "p", "br",
      "ul", "ol", "li", "code", "pre", "blockquote", "span",
    ],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
  });
  /* DOMPurify kept the markup; force safe link behaviour. */
  return clean.replace(
    /<a\s+href=/g,
    '<a rel="noopener noreferrer" target="_blank" href='
  );
}
