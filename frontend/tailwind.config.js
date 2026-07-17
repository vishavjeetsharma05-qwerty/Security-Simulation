export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#a855f7',
          indigoDark: '#7c3aed',
          emerald: '#10b981',
          rose: '#f43f5e',
          slate: '#0b0f19',
          slateLight: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
