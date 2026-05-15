import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Maps a node_modules package name (or prefix) to its output chunk.
// Order matters: first match wins.
const VENDOR_CHUNKS: [string, string][] = [
  // React runtime
  ['react-router-dom', 'vendor-react'],
  ['react-router',     'vendor-react'],   // react-router (internal, pulled by react-router-dom)
  ['scheduler',        'vendor-react'],   // peer dep of react-dom
  ['react-dom',        'vendor-react'],
  ['react/',           'vendor-react'],   // react itself (avoid matching react-*)
  // Query + state
  ['@tanstack/',       'vendor-query'],
  ['zustand',          'vendor-query'],
  // Charts — recharts pulls in a forest of d3 sub-packages and victory-vendor
  ['recharts',         'vendor-recharts'],
  ['d3-',              'vendor-recharts'],
  ['victory-vendor',   'vendor-recharts'],
  // Icons
  ['lucide-react',     'vendor-lucide'],
  // Utilities
  ['axios',            'vendor-utils'],
  ['clsx',             'vendor-utils'],
  ['tailwind-merge',   'vendor-utils'],
  ['js-cookie',        'vendor-utils'],
  ['react-hot-toast',  'vendor-utils'],
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          for (const [pkg, chunk] of VENDOR_CHUNKS) {
            if (id.includes(`/node_modules/${pkg}`)) return chunk
          }
          // All remaining node_modules go into a catch-all vendor chunk
          // rather than polluting the app entry chunk.
          return 'vendor-misc'
        },
      },
    },
  },
})
