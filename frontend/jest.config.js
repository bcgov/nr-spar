/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testEnvironment: '<rootDir>/src/__test__/JSdomPatch.ts',
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
    '^.+\\.(jpg|ico|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__test__/__mocks__/fileMock.ts'
  },
  coverageReporters: [
    'text',
    'cobertura',
    'lcov'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/components/Logout/',
    '<rootDir>/src/components/SilentCheckSso/',
    '<rootDir>/src/contexts/',
    '<rootDir>/src/routes/',
    '<rootDir>/src/service/',
    '<rootDir>/src/api-service/',
    '<rootDir>/src/mock-server/',
    // TODO: remove once parent tree is complete
    '<rootDir>/src/components/SeedlotRegistrationSteps/ParentTreeStep'
  ]
};

process.env = Object.assign(process.env, {
  REACT_APP_KC_URL: 'https://dev.any-keycloak-server.com/auth',
  REACT_APP_KC_REALM: 'default',
  REACT_APP_KC_CLIENT_ID: 'test-client-id'
});
