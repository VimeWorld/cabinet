import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        warmup: {
            clientFiles: ["./src/main.tsx"]
        },
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
    ],
    build: {
        chunkSizeWarningLimit: 700,
    }
})
