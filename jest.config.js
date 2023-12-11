module.exports = {
  preset: "react-native",
  modulePathIgnorePatterns: [
    "example",
    "docs",
    "assets",
    ".yarn",
    "lib",
    ".eslintrc",
  ],
  setupFiles: [
    "./jest-setup.js",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testEnvironment: "node",
  transformIgnorePatterns: [],
};
