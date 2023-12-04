module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-methods",
    "react-native-reanimated/plugin",
    "@babel/plugin-syntax-dynamic-import",
  ],
};
