import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build runs on GitHub Pages under any subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
})
