import { describe, it, expect, vi } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import forgotPasswordVerifyEventHandler from '~~/server/api/auth/password/forgot/verify.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/auth/password/forgot/verify', () => {
  it('returns success response when OTP is verified', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset verified successfully.',
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await forgotPasswordVerifyEventHandler(
      createMockH3Event({ body: { confirmationToken: 'token123', otp: '123456' } }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/password/forgot/verify', {
      method: 'POST',
      body: { confirmationToken: 'token123', otp: '123456' },
    });
    expect(res).toEqual(mockResponse);
  });
});
