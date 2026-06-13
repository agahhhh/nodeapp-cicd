const js = require("@eslint/js");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "logs/**",
      "tests/**",
      ".env",
      ".env.*"
    ]
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        NodeJS: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        jest: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
      "eqeqeq": "error",
      "semi": ["error", "always"]
    }
  }
];