import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
  roots: ['<rootDir>'],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  collectCoverageFrom: [
    "./src/**/*.ts",
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/",
    "/src/model/",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/test/**/*.spec.[jt]s"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
  globalSetup: "./test/setup.ts",
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};

export default jestConfig;
