module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/",
    "/src/model/"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 37000,
  verbose: true,
  testMatch: ["**/test/**/*.spec.[jt]s"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    }
  },
  globalSetup: "./test/setup.ts",
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  }
};
