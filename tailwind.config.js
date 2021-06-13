const colors = require("tailwindcss/colors")

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      amber: colors.amber,
      error: "#F87171",
      emerald: colors.emerald,
      gray: colors.coolGray,
      white: "#FFFFFF",
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ["active", "disabled"],
    },
  },
  plugins: [],
}
