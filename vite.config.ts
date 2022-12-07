import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://cp.vimeworld.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/tinymce/**/*.min.js',
          dest: 'assets',
        },
        {
          src: 'node_modules/tinymce/**/*.min.css',
          dest: 'assets',
        },
      ],
      flatten: false,
    }),
  ]
})
