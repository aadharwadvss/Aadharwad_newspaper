/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        newspaper: {
          cream: '#FFF9F0',
          beige: '#F5E6D3',
          dark: '#2C1810',
          brown: '#8B4513',
          red: '#C41E3A',
          gold: '#D4AF37'
        }
      },
      fontFamily: {
     marathi: ['ShreeLipi 103', 'sans-serif'],
     english: ['ShreeLipi 103', 'serif'],
     },
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3CfeColorMatrix type=\"saturate\" values=\"0\"/%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.05\"/%3E%3C/svg%3E')"
      }
    }
  },
  plugins: []
}
