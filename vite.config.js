import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Obtener la ruta completa del proyecto
const fullPath = process.cwd()
// Extraer la ruta relativa desde htdocs
const relativePath = fullPath.split('htdocs')[1].replace(/\\/g, '/')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost${relativePath}/api`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
