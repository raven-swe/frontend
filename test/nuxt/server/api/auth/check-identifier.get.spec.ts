import { describe, it, expect, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import checkIdentifierEventHandler from '~~/server/api/auth/check-identifier.get';
import { createError } from '#app';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/auth/check-identifier', () => {
  it('returns success response when identifier exists', async () => {
    const mockResponse = { success: true, data: { exists: true, type: 'email' } };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const res = await checkIdentifierEventHandler(
      createMockH3Event({
        query: { identifier: 'test@example.com' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/check-identifier', {
      method: 'GET',
      query: {
        identifier: 'test@example.com',
      },
    });
    expect(res).toEqual(mockResponse);
  });

  it('maps FetchError with backend error message', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'User not found',
      data: { message: 'User not found', code: 'NOT_FOUND' },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);

    await expect(
      checkIdentifierEventHandler(createMockH3Event({ query: { identifier: 'unknown' } })),
    ).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'User not found',
      data: backendError.data,
    });
  });

  it('uses default Internal Server Error when FetchError has no data', async () => {
    mockServerApiFetch.mockRejectedValueOnce(
      createError({
        statusCode: 503,
        statusMessage: 'Internal Server Error',
      }),
    );

    await expect(
      checkIdentifierEventHandler(createMockH3Event({ query: { identifier: 'abc' } })),
    ).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: 'Internal Server Error',
    });
  });
});
