module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|solito|nativewind)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['\\.e2e\\.test\\.(ts|tsx)$'],
  collectCoverageFrom: [
    'lib/api/**/*.{ts,tsx}',
    'lib/hooks/**/*.{ts,tsx}',
    'lib/auth/**/*.{ts,tsx}',
    'components/ui/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/index.ts',
    '!**/_layout.tsx',
    '!**/+html.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 25,
      statements: 25,
    },
  },
};
