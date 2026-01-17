/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 'slate-grey': '#335c67', // Removed to use new palette
        // 'vanilla': '#fff3b0',
        // 'honey': '#e09f3e',
        // 'brown-red': '#9e2a2b',
        // 'bordeaux': '#540b0e',
      }
    },
  },
  plugins: [],
}