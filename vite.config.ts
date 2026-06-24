import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled through DISABLE_HMR when running automated agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching with HMR to save CPU during automated edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Three is isolated into an on-demand WebGL vendor chunk. Keep the
      // warning budget aligned with that async chunk while tests guard the
      // initial entry size and prevent WebGL vendor preloads.
      chunkSizeWarningLimit: 800,
      modulePreload: {
        resolveDependencies(_url, deps, { hostType }) {
          if (hostType !== 'html') return deps;
          return deps.filter(
            (dep) =>
              !dep.includes('vendor-three') &&
              !dep.includes('vendor-r3f'),
          );
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('motion')) {
              return 'vendor-motion';
            }
            if (
              id.includes('@react-three') ||
              id.includes('@pmndrs') ||
              id.includes('postprocessing') ||
              id.includes('maath') ||
              id.includes('meshline') ||
              id.includes('troika') ||
              id.includes('camera-controls')
            ) {
              return 'vendor-r3f';
            }
            if (id.includes('/three/') || id.includes(`${path.sep}three${path.sep}`)) {
              return 'vendor-three';
            }
          },
        },
      },
    },
  };
});
