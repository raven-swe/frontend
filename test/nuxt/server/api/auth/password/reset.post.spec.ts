import { describe, it, expect, vi } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import forgotPassowrdResetEventHandler from '~~/server/api/auth/password/reset.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/auth/password/reset', () => {
  it('returns access and refresh tokens on success', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset successfully.',
      data: { accessToken: 'access_token_123', refreshToken: 'refreshToken_123' },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await forgotPassowrdResetEventHandler(
      createMockH3Event({ body: { confirmationToken: 'token123', newPassword: 'NewPass123!' } }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/password/reset', {
      method: 'POST',
      body: { confirmationToken: 'token123', newPassword: 'NewPass123!' },
    });
    expect(res).toEqual(mockResponse);
  });
});
