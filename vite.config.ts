import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      store: join(__dirname, 'src/store'),
      components: join(__dirname, 'src/components'),
      api: join(__dirname, 'src/api'),
      pages: join(__dirname, 'src/pages'),
      services: join(__dirname, 'src/services'),
      types: join(__dirname, 'src/types'),
      lib: join(__dirname, 'src/lib'),
      assets: join(__dirname, 'src/assets'),
    },
  },
})