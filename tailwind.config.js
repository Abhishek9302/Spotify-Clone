/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1db954",
          greenHover: "#1ed760",
          black: "#121212",
          base: "#000000",
          elevated: "#181818",
          highlight: "#1a1a1a",
          card: "#181818",
          cardHover: "#282828",
          text: "#ffffff",
          subdued: "#b3b3b3",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
