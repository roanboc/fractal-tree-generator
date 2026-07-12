import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // HTML entry points live in pages/; built URLs stay at the site root
  // (dist/web/index.html, dist/web/learn.html, ...).
  root: 'pages',
  base: './',
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
