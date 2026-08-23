/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kth: {
          primary: {
            900: '#1E1B4B',
            800: '#312E81',
            700: '#4338CA',
            600: '#4F46E5', // Primary Brand Action
            500: '#6366F1',
            400: '#818CF8',
            100: '#E0E7FF',
            50:  '#EEF2FF',
          },
          accent: {
            emerald: '#10B981', // Growth & Verification
            'emerald-dark': '#059669',
            'emerald-light': '#D1FAE5',
            cyan: '#06B6D4',    // Intelligence & Insights
            'cyan-light': '#CFFAFE',
            teal: '#0D9488',
          },
          slate: {
            900: '#0F172A', // Dark Canvas & Header
            800: '#1E293B',
            700: '#334155', // Primary Body Text
            600: '#475569',
            500: '#64748B', // Secondary Subtitles
            400: '#94A3B8', // Muted & Disabled
            300: '#CBD5E1',
            200: '#E2E8F0', // Primary Borders
            100: '#F1F5F9', // Surface Fills
            50:  '#F8FAFC', // Canvas Surface
          },
          semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error:   '#EF4444',
            info:    '#0EA5E9',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',   // Controls (Buttons & Inputs)
        lg: '12px',  // Standard Cards
        xl: '16px',  // Modals & Large Surfaces
        '2xl': '20px', // Hero Containers
        full: '9999px', // Status Tags & Pills
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
