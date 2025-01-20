/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      slab: ["Montagu Slab", "Roboto Slab", "Georgia", "serif"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      md: "1.125rem",
      lg: "1.25rem",
      xl: "1.375rem",
      "2xl": "1.5rem",
      "3xl": "1.75rem",
      "4xl": "2rem",
      "5xl": "2.5rem",
      "6xl": "3rem",
      "7xl": "3.75rem",
      "8xl": "4.5rem",
      "9xl": "6rem",
    },
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
        700: "#B02F8B",
        600: "#DF58B9",
        300: "#FAD2EF",
      },
      red: {
        700: "#992C20",
        600: "#E45A39",
        300: "#FFD7D7",
      },
      yellow: {
        700: "#997020",
        600: "#F2C852",
        300: "#F1E3AE",
      },
      green: {
        700: "#4C7031",
        600: "#6B9C5C",
        300: "#C4E4BA",
      },
      blue: {
        700: "#20506D",
        600: "#6190A8",
        300: "#C2DAE6",
      },
      white: "#FFFFFF",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
    },
    extend: {
      backgroundImage: {
        "gradient-landscape": "var(--gradient-svg), var(--gradient-fallback)",
        "gradient-portrait":
          "var(--gradient-svg-mobile), var(--gradient-fallback)",
      },
      transitionTimingFunction: {
        "in-expo": "cubic-bezier(.25,.75,.5,1.25)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};
