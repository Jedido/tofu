const colors = require("tailwindcss/colors")

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      amber: colors.amber,
      emerald: colors.emerald,
      gray: colors.coolGray,
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ["active"],
    },
  },
  plugins: [],
}
