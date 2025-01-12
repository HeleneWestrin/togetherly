/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      dark: {
        950: "#141919",
        900: "#1F2828",
        800: "#283333",
        700: "#324040",
        600: "#516262",
        500: "#728A8A",
        400: "#859A9A",
        300: "#A5B7B7",
        200: "#C9DADA",
        100: "#E5F1F1",
      },
      pink: {
        600: "#DF58B9",
        300: "#FAD2EF",
      },
      red: {
        600: "#E45A39",
        300: "#FFD7D7",
      },
      yellow: {
        600: "#F2C852",
        300: "#F1E3AE",
      },
      green: {
        600: "#6B9C5C",
        300: "#C4E4BA",
      },
      blue: {
        600: "#6190A8",
        300: "#C2DAE6",
      },
      white: "#FFFFFF",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
    },
    extend: {},
  },
  plugins: [],
};
