import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6F3CFF',
        secondary: '#00D4FF',
        background: '#0A0A0A',
        surface: '#111111',
        card: '#161616',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
        brand: {
          500: '#6F3CFF',
          600: '#5c28f0',
        },
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(0,0,0,0.5)',
        glow: '0 0 35px -5px rgba(111, 60, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
