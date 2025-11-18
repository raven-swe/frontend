import { describe, it, expect, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import checkEmailEventHandler from '~~/server/api/auth/check-email.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/auth/check-email', () => {
  it('returns success response when email exists', async () => {
    const mockResponse = { success: true, data: { exists: true } };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await checkEmailEventHandler(
      createMockH3Event({
        query: { email: 'test@example.com' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/check-email', {
      method: 'GET',
      query: {
        email: 'test@example.com',
      },
    });
    expect(res).toEqual(mockResponse);
  });
});
