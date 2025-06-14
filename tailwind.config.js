export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0E7D6D",
        secondary: "#FFC107",
        // Add Cameroon-inspired colors if desired
        cameroon: {
          green: "#007A5E",
          red: "#CE1126",
          yellow: "#FCD116",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};