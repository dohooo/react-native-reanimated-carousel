module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^react$": "<rootDir>/node_modules/react",
    "^react/jsx-runtime$": "<rootDir>/node_modules/react/jsx-runtime",
    "^react-native$": "<rootDir>/node_modules/react-native",
    "^react-native-gesture-handler$": "<rootDir>/node_modules/react-native-gesture-handler",
    "^react-native-reanimated$": "<rootDir>/node_modules/react-native-reanimated/mock",
  },
};
