const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to an in-memory MongoDB instance before all tests.
 * This avoids polluting or depending on a real database.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set env vars needed by the app
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.NODE_ENV = 'test';
  process.env.GEMINI_API_KEY = 'test-gemini-key';

  await mongoose.connect(uri);
});

/**
 * Clear all collections between tests for isolation.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Close connection and stop the in-memory server after all tests.
 */
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
