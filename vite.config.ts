import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { razorpayApiPlugin } from './src/services/payment/viteRazorpayServerPlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), razorpayApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});

