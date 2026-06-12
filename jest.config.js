/* global module */

module.exports = {
  passWithNoTests: true,
  testEnvironment: 'node',
  testTimeout: 60_000,
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/helpers/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
}
