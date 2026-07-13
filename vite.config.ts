import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';

// The HTML entry points live in pages/ (the Vite root) and reference the
// TypeScript/CSS sources one level up (../src/...). At build time Rollup
// resolves those relative to the HTML file on disk, so the bundle is
// correct. The dev server, however, receives the browser-normalized URL
// (/src/...) and would resolve it against pages/ — this middleware maps it
// back to the real src/ directory via Vite's /@fs/ escape hatch.
function serveSrcAboveRoot(): Plugin {
  return {
    name: 'serve-src-above-root',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/src/')) {
          req.url = `/@fs${resolve(__dirname)}${req.url}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // HTML entry points live in pages/; built URLs stay at the site root
  // (dist/web/index.html, dist/web/learn.html, ...).
  root: 'pages',
  base: './',
  plugins: [serveSrcAboveRoot()],
  build: {
    outDir: resolve(__dirname, 'dist/web'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/index.html'),
        learn: resolve(__dirname, 'pages/learn.html'),
        generator: resolve(__dirname, 'pages/generator.html'),
        snowflake: resolve(__dirname, 'pages/snowflake.html'),
        create: resolve(__dirname, 'pages/create.html'),
        tree3d: resolve(__dirname, 'pages/tree3d.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
