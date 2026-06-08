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
  testTimeout: 25000,
  verbose: true,
  testMatch: ["**/test/**/*.spec.[jt]s"],
  globalSetup: "./test/setup.ts",
  globals: {},
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    "uuid": require.resolve('uuid'),
    '^axios$': require.resolve('axios'),
    '^@opentelemetry/([^/]+)/(.+)$': '<rootDir>/node_modules/@opentelemetry/$1/build/src/index-$2',
  },
};
