import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from '#app';
import userRepliesHandler from '~~/server/api/users/[username]/replies.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/users/[username]/replies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user profile data for valid username', async () => {
    const mockResponse = {
      success: true,
      data: {
        username: 'johndoe',
        fullName: 'John Doe',
        bio: 'Just a test user',
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { username: 'johndoe' },
    });

    const response = await userRepliesHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/users/johndoe/replies', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
  });

  it('throws error for invalid username parameter', async () => {
    const emptyUsernameEvent = createMockH3Event({
      method: 'GET',
      params: {},
    });

    await expect(userRepliesHandler(emptyUsernameEvent)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['username is a required field'],
          message: 'username is a required field',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();

    const shortUsernameEvent = createMockH3Event({
      method: 'GET',
      params: { username: 'a' },
    });

    await expect(userRepliesHandler(shortUsernameEvent)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['username must be at least 3 characters'],
          message: 'username must be at least 3 characters',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
