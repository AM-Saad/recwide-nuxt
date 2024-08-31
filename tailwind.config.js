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
    },
  },
  plugins: [],
}
