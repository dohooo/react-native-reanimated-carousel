module.exports = {
  extends: "@dohooo",
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "quotes": "off",
    "@typescript-eslint/quotes": "error",
    "operator-linebreak": "off",
    "@typescript-eslint/indent": "off",
  },
  plugins: ["jest", "prettier"],
};
