import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import resendOtpPostEventHandler from '~~/server/api/settings/email/resend-otp.post';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/settings/email/resend-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Otp resent successfully.',
    });
    const event = createMockH3Event({
      method: 'POST',
      body: {
        confirmationToken: 'some-token',
      },
    });
    const response = await resendOtpPostEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/email/resend-otp', {
      method: 'POST',
      body: {
        confirmationToken: 'some-token',
      },
    });
    expect(response).toEqual({
      success: true,
      message: 'Otp resent successfully.',
    });
  });
});
