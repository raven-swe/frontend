import { beforeEach, describe, expect, it, vi } from 'vitest';
import blocksPostEventHandler from '~~/server/api/me/blocks/[username]/index.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from 'h3';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/me/blocks/[username]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'Block updated successfully',
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
      params: { username: 'johndoe' },
    });
    const response = await blocksPostEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/blocks/johndoe', {
      method: 'POST',
    });
    expect(response).toEqual(mockResponse);
  });

  it('throws error for invalid username parameter', async () => {
    const emptyUsernameEvent = createMockH3Event({
      method: 'POST',
      params: {},
    });

    await expect(blocksPostEventHandler(emptyUsernameEvent)).rejects.toEqual(
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

    await expect(blocksPostEventHandler(shortUsernameEvent)).rejects.toEqual(
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
