import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import forgetPassowrdEventHandler from '~~/server/api/auth/password/forgot/index.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/auth/password/forgot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns confirmation token on success', async () => {
    const mockResponse = {
      success: true,
      message: 'OTP sent successfully.',
      data: { confirmationToken: 'token123' },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await forgetPassowrdEventHandler(
      createMockH3Event({ body: { identifier: 'test@example.com', recaptchaToken: 'recap123' } }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/password/forgot', {
      method: 'POST',
      body: { identifier: 'test@example.com', recaptchaToken: 'recap123' },
    });
    expect(res).toEqual(mockResponse);
  });
});
