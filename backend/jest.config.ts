import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  setupFiles: ['<rootDir>/tests/dotenv-setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleNameMapper: {
    '^puppeteer$': '<rootDir>/tests/__mocks__/puppeteer.js',
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.js',
  },
};

export default config;
