import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration de build optimisée
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    
    // Optimisation du chunking
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion'],
          utils: ['axios']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Réduction de la taille
    chunkSizeWarningLimit: 1000
  },
  
  // Proxy pour le développement
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Prévisualisation
  preview: {
    port: 4173,
    host: true
  },
  
  // Définition des variables globales
  define: {
    'process.env': {}
  }
});