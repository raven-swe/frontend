import { describe, it, expect, vi, beforeEach } from 'vitest';

import { accountService } from '@/services/auth/accountService';
import { registerEndpoint } from '@nuxt/test-utils/runtime';

describe('accountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('calls $fetch correctly for checkAccountExists()', async () => {
    registerEndpoint('/api/auth/check-identifier', () => {
      return { data: { exists: true, type: 'email' } };
    });

    const exists = await accountService.checkAccountExists('user@example.com');
    expect(exists).toBe(true);
  });

  it('returns false when API does not return exists field', async () => {
    registerEndpoint('/api/auth/check-identifier', () => {
      return { data: {} };
    });

    const exists = await accountService.checkAccountExists('user@example.com');
    expect(exists).toBe(false);
  });
});
