import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React Core & Router (Essential React framework runtime)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'react-router';
          }
          
          // Supabase Client SDK (Backend data sync & authentication client)
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase';
          }
          
          // Authentication Gateway (Clerk auth SDK)
          if (id.includes('node_modules/@clerk/')) {
            return 'auth-vendor';
          }

          // UI Icon Set (Lucide React SVG iconography)
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons';
          }

          // Security Sanitization (DOMPurify XSS protection)
          if (id.includes('node_modules/dompurify')) {
            return 'security';
          }
        }
      }
    }
  }
})

