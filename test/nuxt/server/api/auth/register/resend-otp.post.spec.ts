import { describe, expect, it, vi } from 'vitest';
import resendOtpPostEventHander from '~~/server/api/auth/register/resend-otp.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

vi.stubGlobal(
  'serverApiFetch',
  async (
    url: string,
    options: { method: string; body: { name: string; email: string; birthDate: string } },
  ) => {
    if (url === '/auth/register/resend-otp' && options.method === 'POST') {
      return {
        status: 200,
        data: {
          success: true,
          message: 'OTP resent successfully',
        },
      };
    }
  },
);

describe('server/api/auth/register/start.post', () => {
  it('should return 200 for valid requests', async () => {
    const event = createMockH3Event({
      method: 'POST',
      body: { creationToken: 'valid-creation-token' },
    });
    const response = await resendOtpPostEventHander(event);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      success: true,
      message: 'OTP resent successfully',
    });
  });
});
