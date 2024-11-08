/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./modules/**/*.{js,vue,ts}",
    // './nuxt.config.{js,ts}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      backgroundColor: {
        theme: "#fe9548",
        "theme-light": "#ffac6a",
        "theme-dark": "#e07c3e",
        "theme-darker": "#d06e31",
      },
      colors: {
        "tan-hide": {
          50: "#fff7ed",
          100: "#ffecd4",
          200: "#ffd5a9",
          300: "#ffb672",
          400: "#fe9548",
          500: "#fc6c13",
          600: "#ed5109",
          700: "#c53b09",
          800: "#9c2f10",
          900: "#7e2910",
          950: "#441106",
        },
      },
    },
  },
  plugins: [],
}
