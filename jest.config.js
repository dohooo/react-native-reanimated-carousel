module.exports = {
  preset: "react-native",
  modulePathIgnorePatterns: ["example", "docs", "assets", ".yarn", "lib"],
  setupFilesAfterEnv: ["./test/jest-setup.js"],
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
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@react-native|react-native|@react-navigation))",
  ],
};
