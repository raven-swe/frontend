import { describe, expect, it, vi } from 'vitest';
import verifyPostEventHander from '~~/server/api/auth/register/verify.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/auth/register/verify.post', () => {
  it('should return 200 for valid requests', async () => {
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'OTP verified successfully',
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
      body: { otp: '123456', creationToken: 'valid-creation-token' },
    });
    const response = await verifyPostEventHander(event);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      success: true,
      message: 'OTP verified successfully',
    });
  });
});
