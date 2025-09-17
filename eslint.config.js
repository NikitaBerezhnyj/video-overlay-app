const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");
const sonarjs = require("eslint-plugin-sonarjs");

module.exports = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
      sourceType: "commonjs"
    },
    plugins: {
      sonarjs
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,

      "no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: true }],
      "no-console": "warn",
      "sonarjs/pseudo-random": "off",
      "sonarjs/no-commented-code": "warn",
      "sonarjs/cognitive-complexity": ["error", 15]
    }
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      "no-console": "off"
    }
  }
]);
