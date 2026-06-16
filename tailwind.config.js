/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#00F5FF',
          500: '#00d4e0',
          600: '#00b3bd',
        },
        purple: {
          500: '#7B61FF',
          600: '#6949ff',
        },
        slate: {
          950: '#0A1628',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(123, 97, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
