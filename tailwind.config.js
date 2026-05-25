/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.{ts,tsx}',
    './index.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './constants.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        brand: {
          dark: '#0F172A',
          navy: '#1e293b',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          neon: '#00f3ff',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        cairo: ['Cairo', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blob: 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  safelist: [],
  plugins: [],
};
