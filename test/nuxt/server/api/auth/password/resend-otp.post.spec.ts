import { describe, it, expect, vi } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import forgotPasswordResendOtpEventHandler from '~~/server/api/auth/password/resend-otp.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/auth/password/resend-otp', () => {
  it('returns success response when OTP is resent', async () => {
    const mockResponse = {
      success: true,
      message: 'otp resent successfully.',
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await forgotPasswordResendOtpEventHandler(
      createMockH3Event({ body: { confirmationToken: 'token123' } }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/password/resend-otp', {
      method: 'POST',
      body: { confirmationToken: 'token123' },
    });
    expect(res).toEqual(mockResponse);
  });
});
