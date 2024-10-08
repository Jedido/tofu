const colors = require("tailwindcss/colors")

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    colors: {
      amber: colors.amber,
      error: "#F87171",
      emerald: colors.emerald,
      gray: colors.gray,
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
