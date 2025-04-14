import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Add base configuration for proper asset paths
  base: './', // Changed from default '/' to relative paths
  
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Optional: Add build configuration for better asset handling
  build: {
    assetsDir: 'assets', // Organizes assets in separate directory
    manifest: true, // Generates manifest.json for production
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});