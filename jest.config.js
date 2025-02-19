module.exports = {
  verbose: true,
  setupFiles: ['<rootDir>/test/jest/setEnvVars.ts'],
  testTimeout: 70000,
  maxWorkers: 1,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^dist/lib/utils/constants/constant$':
      '<rootDir>/agent/lib/utils/constants/constant',
    '^dist/(.*)$': '<rootDir>/agent/$1',
    '^agent/(.*)$': '<rootDir>/agent/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
};
