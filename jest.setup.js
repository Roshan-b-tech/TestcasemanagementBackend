// Global test setup
beforeAll(() => {
  // Add any global setup here
});

afterAll(async () => {
  // Cleanup any remaining handles
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Increase timeout for all tests
jest.setTimeout(30000);