import { useEffect } from "react";
import { art } from "../lib/assets.js";

const SITE = "FNAF Wiki";
const DEFAULT_DESCRIPTION =
  "A fan-made Five Nights at Freddy's encyclopedia — every character, every game, the full lore timeline, films, books, community news and a vault full of secrets.";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Page-level metadata, Open Graph cards, canonical URL and structured data.
 *
 * `schema` can be a single JSON-LD object or an array. When omitted, a clean
 * WebSite/WebPage graph is emitted so search engines still understand the page.
 */
export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  type = "website",
  schema,
  noindex = false,
  keywords,
}) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — The Fan Encyclopedia`;
    const canonical = window.location.href;
    const ogImage = new URL(image || art("office"), window.location.href).href;
    const origin = window.location.origin;
    const path = window.location.pathname;

    document.title = full;
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("name", "theme-color", "#05060a");

    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", SITE);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:alt", `${title || SITE} artwork`);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", full);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    setLink("canonical", canonical);

    const graph = [
      {
        "@type": "WebSite",
        "@id": `${origin}${path}#website`,
        name: SITE,
        url: canonical,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}${path}#/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        name: full,
        description,
        url: canonical,
        isPartOf: { "@id": `${origin}${path}#website` },
        primaryImageOfPage: { "@type": "ImageObject", url: ogImage },
      },
    ];

    const structured = schema
      ? Array.isArray(schema)
        ? schema
        : [schema]
      : [];

    let script = document.getElementById("fnaf-page-schema");
    if (!script) {
      script = document.createElement("script");
      script.id = "fnaf-page-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [...graph, ...structured],
    });
  }, [title, description, image, type, schema, noindex, keywords]);

  return null;
}

export { SITE, DEFAULT_DESCRIPTION };
