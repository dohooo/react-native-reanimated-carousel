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
  setupFiles: ["./jest-setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testEnvironment: "node",
  transformIgnorePatterns: [],
};
