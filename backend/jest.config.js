module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.js'],
  testTimeout: 15000,
  // Prevent open handle warnings from mongoose/mongodb-memory-server
  forceExit: true,
  detectOpenHandles: true,
};
