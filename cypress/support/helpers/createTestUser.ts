export interface TestUser {
  name: string;
  email: string;
  dob: { day: string; month: string; year: string };
  password?: string;
}

export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const timestamp = Date.now();
  return {
    name: overrides.name || `Test User ${timestamp}`,
    email: overrides.email || `testuser${timestamp}@example.com`,
    dob: overrides.dob || { day: '15', month: '6', year: '1995' },
    password: overrides.password || 'TestPass123!',
    ...overrides,
  };
};
