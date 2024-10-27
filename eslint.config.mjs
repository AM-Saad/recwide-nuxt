// @ts-check
// eslint.config.mjs
import withNuxt from "./.nuxt/eslint.config.mjs"
import globals from "globals"

export default withNuxt([
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },

  {
    files: ["**/*.vue", "**/*.ts", "**/*.js"],

    rules: {
      "no-console": "warn",
      "vue/first-attribute-linebreak": [
        "error",
        {
          singleline: "ignore",
          multiline: "below",
        },
      ],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: 2,
          multiline: 2,
        },
      ],
      "vue/multi-word-component-names": "error",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
        },
      ],
      "@typescript-eslint/no-unused-vars":
        process.env.NODE_ENV === "production" ? "error" : "warn",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
    },

    ignores: ["node_modules/", "dist/"],
  },
  {
    files: ["pages/**/*.vue", "modules/**/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off", // Disable the rule for Vue files in the pages directory
    },
  },
])
