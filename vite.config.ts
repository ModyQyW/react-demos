import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import pages from 'vite-plugin-pages';
import env from 'vite-plugin-env-compatible';
import compression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    pages(),
    compression(),
    env({
      prefix: 'VITE',
    }),
    eslint({
      fix: true,
    }),
    stylelint({
      fix: true,
    }),
  ],
  server: {
    fs: {
      strict: true,
    },
    host: true,
  },
});
