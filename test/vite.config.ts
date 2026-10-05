import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Bun can't symlink the workspace root into a member, so point at the built package in the repo root.
    alias: { 'vaul-responsive': fileURLToPath(new URL('..', import.meta.url)) },
    // The library resolves React from outside this app.
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 3000, strictPort: true },
});
