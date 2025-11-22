/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'deep-dark': '#0A0A0A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'gradient-text': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
      },
      letterSpacing: {
        'tighter': '-0.05em',
      },
      animation: {
        'blob': 'blob 20s infinite',
        'blob-slow': 'blob 30s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
      },
    },
  },
  plugins: [],
}
