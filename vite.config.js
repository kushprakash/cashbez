import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        cors: true,
        hmr: {
            host: '127.0.0.1',
        },
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: 'public/build',
        manifest: 'manifest.json',
        emptyOutDir: true,
        chunkSizeWarningLimit: 8000,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            }
        }
    },
});


