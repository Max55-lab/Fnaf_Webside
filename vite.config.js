import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
