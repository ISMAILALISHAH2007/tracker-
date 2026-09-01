/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          950: '#07090e',
          900: '#0d121d',
          850: '#111726',
          800: '#161e31',
          700: '#1f2b45',
          600: '#2e3e60',
        },
        brand: {
          indigo: '#6366f1',
          'indigo-light': '#818cf8',
          sky: '#0ea5e9',
          'sky-light': '#38bdf8',
          emerald: '#10b981',
          'emerald-light': '#34d399',
          crimson: '#f43f5e',
          'crimson-light': '#fb7185',
          amber: '#f59e0b',
          'amber-light': '#fbbf24',
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.35)',
        'glow-sky': '0 0 30px -5px rgba(14, 165, 233, 0.35)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.35)',
        'glow-crimson': '0 0 30px -5px rgba(244, 63, 94, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'radar-ping': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        radarPing: {
          '75%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
