import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Content-Security-Policy for the *built* site. `vite dev` stays
// CSP-free because Vite's react-refresh preamble is an inline script;
// `vite preview` and the deployed hosts (netlify.toml / vercel.json)
// serve the same policy so it can be verified before shipping.
// The JSON-LD data block PageMeta injects is non-executing, so
// script-src 'self' does not affect it.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "font-src 'self' data:",
  // Live fetches: rss2json (Fazbear News Network) + Fandom Wiki API.
  "connect-src 'self' https://api.rss2json.com https://freddy-fazbears-pizza.fandom.com",
  // Embedded media: YouTube nocookie player + the two fan web-game mirrors.
  "frame-src https://www.youtube-nocookie.com https://irv77.github.io https://dorukyum.github.io",
  // Inline save worker is a Blob (data: covers older Vite inline builds).
  "worker-src 'self' blob: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

// Two build flavours:
//   default  -> dist/        normal split build for hosting
//   --mode single -> dist-single/  one JS bundle, used to build FNAF-Wiki.html
//
// The standalone HTML has to inline every script, so lazy-loaded chunks are
// collapsed into the entry bundle for that build only.
export default defineConfig(({ mode }) => {
  const single = mode === 'single'

  return {
    plugins: [react()],
    // Relative asset paths so the built site also works when opened
    // directly from disk (dist/index.html) as well as from any subfolder host.
    base: './',
    preview: {
      headers: {
        'Content-Security-Policy': CSP,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    build: single
      ? {
          outDir: 'dist-single',
          emptyOutDir: true,
          rollupOptions: {
            output: { codeSplitting: false },
          },
        }
      : {},
  }
})
