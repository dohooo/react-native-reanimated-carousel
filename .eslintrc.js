module.exports = {
  extends: "@dohooo",
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "quotes": "off",
    "@typescript-eslint/quotes": "error",
    "operator-linebreak": "off",
    "@stylistic/js/operator-linebreak": ["error", "before"],
  },
  plugins: [
    "jest",
    "@stylistic/js",
  ],
};
