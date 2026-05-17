/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rice-green': '#1E5631',    // Verde profundo agrícola
        'rice-emerald': '#4C9A2A',  // Acento vibrante
        'rice-light': '#F0F7F4',    // Fondo muy suave
        'rice-gold': '#D4AF37',     // Acento premium (cosecha)
        'rice-dark': '#112D18',     // Texto oscuro corporativo
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(30, 86, 49, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}