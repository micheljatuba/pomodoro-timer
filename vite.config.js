import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,   // Desativado em produção — protege o código-fonte
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.log em produção
        drop_debugger: true,
      },
      format: {
        comments: false,       // Remove todos os comentários do bundle
      },
    },
  },
})
