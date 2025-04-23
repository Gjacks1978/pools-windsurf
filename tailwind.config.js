/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // habilita dark mode via classe .dark
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas aqui, se necessário
      },
    },
  },
  plugins: [],
};
