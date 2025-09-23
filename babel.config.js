module.exports = {
  presets: [
    [
      "@babel/preset-typescript",
      {
        allowNamespaces: true,
        isTSX: true,
        allExtensions: true,
      },
    ],
    "@react-native/babel-preset",
  ],
  plugins: [
    "@babel/plugin-syntax-typescript",
    "react-native-worklets/plugin",
    "@babel/plugin-syntax-dynamic-import",
  ],
};
