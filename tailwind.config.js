/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: 0, transform: 'translateY(-10px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}
