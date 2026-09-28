import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // The library is a symlinked workspace package with its own peer install of React.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 3000, strictPort: true },
});
