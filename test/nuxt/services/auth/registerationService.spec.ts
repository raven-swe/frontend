import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { registerationService } = await import('@/services/auth/registerationService');

describe('registerationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls $fetch correctly for start()', async () => {
    registerEndpoint('/api/auth/register/start', () => {
      return { data: { creationToken: 'abc123' } };
    });

    const payload = { name: 'Alice', email: 'a@b.com', birthDate: '2000-01-01' };
    const result = await registerationService.start(payload);

    expect(result).toEqual({ data: { creationToken: 'abc123' } });
  });

  it('calls $fetch correctly for verify()', async () => {
    registerEndpoint('/api/auth/register/verify', () => {
      return { success: true };
    });

    const result = await registerationService.verify('123456', 'ct-1');
    expect(result).toEqual({ success: true });
  });

  it('calls $fetch correctly for resendOtp()', async () => {
    registerEndpoint('/api/auth/register/resend-otp', () => {
      return { success: true };
    });

    const result = await registerationService.resendOtp('ct-1');
    expect(result).toEqual({ success: true });
  });

  it('calls $fetch correctly for complete()', async () => {
    registerEndpoint('/api/auth/register/complete', () => {
      return { success: true, data: { accessToken: 'xyz789', refreshToken: 'abc123' } };
    });

    const result = await registerationService.complete('MyPass123!', 'ct-final');

    expect(result).toEqual({
      success: true,
      data: { accessToken: 'xyz789', refreshToken: 'abc123' },
    });
  });

  it('calls $fetch correctly for checkEmail()', async () => {
    registerEndpoint('/api/auth/check-email', () => {
      return { data: { exists: true } };
    });

    const exists = await registerationService.checkEmail('a@b.com');
    expect(exists).toBe(true);
  });
});
