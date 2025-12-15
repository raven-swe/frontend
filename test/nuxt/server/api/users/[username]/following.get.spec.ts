import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from '#app';
import followingGetEventHandler from '~~/server/api/users/[username]/following.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/users/[username]/following', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user following data for valid username', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          username: 'janedoe',
          fullName: 'Jane Doe',
          relationship: {
            blocking: false,
            blockedBy: false,
            muted: false,
            following: false,
            follower: false,
          },
        },
      ],
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { username: 'johndoe' },
      query: {
        cursor: 'abc123',
        limit: '10',
      },
    });

    const response = await followingGetEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/users/johndoe/following', {
      method: 'GET',
      query: { cursor: 'abc123', limit: '10' },
    });
    expect(response).toMatchObject({
      ...mockResponse,
      data: [
        {
          username: 'janedoe',
          fullName: 'Jane Doe',
          relationship: {
            blocking: false,
            blockedBy: false,
            muted: false,
            following: false,
            follower: false,
          },
        },
      ],
    });
  });

  it('throws error for invalid username parameter', async () => {
    const emptyUsernameEvent = createMockH3Event({
      method: 'GET',
      params: {},
    });

    await expect(followingGetEventHandler(emptyUsernameEvent)).rejects.toEqual(
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

    await expect(followingGetEventHandler(shortUsernameEvent)).rejects.toEqual(
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
