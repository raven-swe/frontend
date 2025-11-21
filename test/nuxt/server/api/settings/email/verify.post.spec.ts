import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import verifyPostEventHandler from '~~/server/api/settings/email/verify.post';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PUT /api/settings/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Email verified successfully.',
    });
    const event = createMockH3Event({
      method: 'POST',
      body: {
        otp: 'some-otp',
        confirmationToken: 'some-token',
      },
    });
    const response = await verifyPostEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/email/verify', {
      method: 'POST',
      body: {
        otp: 'some-otp',
        confirmationToken: 'some-token',
      },
    });
    expect(response).toEqual({
      success: true,
      message: 'Email verified successfully.',
    });
  });
});
