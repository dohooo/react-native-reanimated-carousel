module.exports = {
  preset: "react-native",
  modulePathIgnorePatterns: ["example", "docs", "assets", ".yarn", "lib"],
  setupFiles: ["./test/jest-setup.js", "./node_modules/react-native-gesture-handler/jestSetup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  coverageReporters: ["text", "lcov", "cobertura"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/types.ts",
    "!src/index.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: "node",
  transformIgnorePatterns: [],
};
