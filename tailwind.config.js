/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scrollText: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-52.5%)' }
        }
      },
      animation: {
        'scrollText': 'scrollText 8s linear infinite'
      }
    },
  },
  plugins: [],
}