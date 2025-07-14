/**
 * Vite Configuration for Training Company Frontend (Vite 5.x)
 * 
 * Configuration for Vite build tool including React plugin setup,
 * development server configuration, and build optimization settings.
 * Updated for Vite 5.x and Node 20 compatibility.
 * 
 * @fileoverview Vite 5.x configuration for React development and production builds
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for Node 20 + Vite 5.x
 * 
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include JSX runtime for better development experience
      jsxRuntime: 'automatic',
    })
  ],
  
  // Development server configuration
  server: {
    port: 5173, // Vite 5.x default port
    host: true, // Allow external connections (useful for mobile testing)
    open: true, // Automatically open browser
    cors: true,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Configure proxy with better error handling
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    // Watch options for better performance
    watch: {
      usePolling: false,
      interval: 100
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Modern target for better performance with Node 20
    target: 'esnext',
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios']
        }
      }
    },
    // Bundle size warning threshold
    chunkSizeWarningLimit: 1000,
    // Enhanced minification for production
    minify: 'esbuild', // Faster than terser, better with Vite 5
    // Report compressed size
    reportCompressedSize: true,
    // Enhanced CSS code splitting
    cssCodeSplit: true
  },

  // Path resolution with enhanced alias support
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks')
    }
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
    // CSS modules configuration (if needed in future)
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Environment variables configuration
  envPrefix: 'VITE_',

  // Preview server configuration (for production preview)
  preview: {
    port: 5173,
    host: true,
    open: true,
    cors: true
  },

  // Optimization settings for better performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ],
    // Force optimization of these packages
    force: true
  },

  // Enhanced logging configuration
  logLevel: 'info',
  clearScreen: false,

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __NODE_VERSION__: JSON.stringify(process.version)
  },

  // Enhanced esbuild configuration for better performance
  esbuild: {
    target: 'esnext',
    platform: 'browser',
    format: 'esm'
  }
});