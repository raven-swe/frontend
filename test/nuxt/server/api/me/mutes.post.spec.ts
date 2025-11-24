import { beforeEach, describe, expect, it, vi } from 'vitest';
import mutesPostEventHandler from '~~/server/api/me/mutes/[username]/index.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from 'h3';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/me/mutes/[username]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'Mute updated successfully',
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
      params: { username: 'johndoe' },
    });
    const response = await mutesPostEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/mutes/johndoe', {
      method: 'POST',
    });
    expect(response).toEqual(mockResponse);
  });

  it('throws error for invalid username parameter', async () => {
    const emptyUsernameEvent = createMockH3Event({
      method: 'POST',
      params: {},
    });

    await expect(mutesPostEventHandler(emptyUsernameEvent)).rejects.toEqual(
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
      method: 'POST',
      params: { username: 'a' },
    });

    await expect(mutesPostEventHandler(shortUsernameEvent)).rejects.toEqual(
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
