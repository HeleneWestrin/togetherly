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
        200: "#ced9d9",
        100: "#E7EBEB",
        50: "#EFF2F2",
      },
      pink: {
        700: "#B02F8B",
        600: "#DF58B9",
        300: "#FAD2EF",
        100: "#FDEBF9",
      },
      red: {
        700: "#992C20",
        600: "#E45A39",
        500: "#F28B7D",
        400: "#F8ACA2",
        300: "#FFD7D7",
        100: "#FFEBEB",
      },
      yellow: {
        700: "#997020",
        600: "#F2C852",
        300: "#F1E3AE",
        100: "#F9F5E9",
      },
      green: {
        700: "#4C7031",
        600: "#6B9C5C",
        300: "#C4E4BA",
        100: "#F9F5E9",
      },
      blue: {
        700: "#20506D",
        600: "#6190A8",
        300: "#C2DAE6",
        100: "#F9F5E9",
      },
      white: "#FFFFFF",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      spacing: {
        "desktop-nav": "16rem",
        "desktop-nav-2xl": "20rem",
      },
      width: {
        "full-minus-nav": "calc(100% - 16rem)",
        "full-minus-nav-2xl": "calc(100% - 20rem)",
      },
      boxShadow: {
        "pink-focus": "0 0 0 4px rgb(223 88 185 / 0.2)",
        "dark-focus": "0 0 0 4px rgb(32 40 40 / 0.2)",
      },
      backgroundImage: {
        "gradient-landscape": "var(--gradient-svg), var(--gradient-fallback)",
        "gradient-portrait":
          "var(--gradient-svg-mobile), var(--gradient-fallback)",
      },
      lineHeight: {
        tightest: "1.15",
      },
      transitionTimingFunction: {
        "in-expo": "cubic-bezier(.25,.75,.5,1.25)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".appearance-textfield": {
          "-webkit-appearance": "textfield",
          "-moz-appearance": "textfield",
          appearance: "textfield",
        },
      };

      addUtilities(newUtilities, ["responsive"]);
    },
  ],
  safelist: [
    "peer/one",
    "peer/two",
    "peer/three",
    "peer-checked/one:text-white",
    "peer-checked/two:text-white",
    "peer-checked/three:text-white",
    "peer-focus-visible/one:border-2",
    "peer-focus-visible/two:border-2",
    "peer-focus-visible/three:border-2",
    "peer-focus-visible/one:border-pink-600",
    "peer-focus-visible/two:border-pink-600",
    "peer-focus-visible/three:border-pink-600",
    "peer-checked/two:translate-x-[100%]",
    "peer-checked/three:translate-x-[200%]",
  ],
};
