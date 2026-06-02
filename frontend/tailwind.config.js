module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          main: '#0A0A0F',
          card: '#111118',
          nav: '#0D0D14',
          stat: '#1A1A2E',
          panel: '#0F0F1A',
          hover: '#13131F'
        },
        accent: {
          primary: '#FFFFFF',
          emerald: '#00D9A3'
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'line-draw': 'lineDraw 1.5s ease-out forwards',
        'pulse-slow': 'pulseSlow 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        lineDraw: {
          '0%': { height: '0%' },
          '100%': { height: '100%' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}