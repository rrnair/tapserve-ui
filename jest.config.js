const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/dist/test/coverage',
  coverageReporters: ['text', 'json', 'html'],
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/stores/**/*.{ts,tsx}',
    'src/types/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/app/**',
    '!src/components/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Test reporters
  reporters: [ "default", "jest-html-reporter"],
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
    '<rootDir>/cypress/',
    '<rootDir>/e2e/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)