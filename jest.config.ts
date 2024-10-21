import { compilerOptions } from './tsconfig.json';
import { pathsToModuleNameMapper } from 'ts-jest'

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths);

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['html', 'text-summary', 'clover', 'cobertura'],
  coverageDirectory: 'coverage/dpm',
  globalSetup: 'jest-preset-angular/global-setup',
  modulePaths: ['<rootDir>'],
  moduleNameMapper,
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'interfaces',
    'jestGlobalMocks.ts',
    '.module.ts',
    '<rootDir>/src/app/main.ts',
    '.html'
  ],
  coverageThreshold: {
    global: {
      statements: 24.5,
      branches: 5,
      functions: 14,
      lines: 23.5
    }
  }
};
