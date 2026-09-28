/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dhakaRed: "#D32F2F",
        dhakaYellow: "#FBC02D",
        teslaRed: "#E82127",
      },
    },
  },
  plugins: [],
};
