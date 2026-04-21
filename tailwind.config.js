/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2', // Beige
        text: '#2C1B18', // Deep brown text
        primary: {
          light: '#6F4E37', // Coffee light
          DEFAULT: '#4B2E2B', // Coffee dark
          dark: '#2C1B18', // Deep brown
        },
        accent: {
          light: '#D4C4A8', // Light Gold
          DEFAULT: '#C8A97E', // Accent Gold
          dark: '#A68A60', // Dark Gold
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
