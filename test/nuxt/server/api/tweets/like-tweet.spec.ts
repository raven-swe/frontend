import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import likeTweetByIdGetHandler from '~~/server/api/tweets/[id]/like/index.post';
import unLikeTweetByIdGetHandler from '~~/server/api/tweets/[id]/like/index.delete';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('POST /api/tweets/[id]/like', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should like tweet by id successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'liked tweet successfully',
    });

    const event = createMockH3Event(
      {
        method: 'POST',
        params: { id: '1' },
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    const response = await likeTweetByIdGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/like', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'liked tweet successfully',
    });
  });

  it('should unlike tweet by id successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'unliked tweet successfully',
    });

    const event = createMockH3Event(
      {
        method: 'DELETE',
        params: { id: '1' },
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    const response = await unLikeTweetByIdGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/like', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'unliked tweet successfully',
    });
  });

  it('should handle missing tweet id parameter on like', async () => {
    const event = createMockH3Event(
      {
        method: 'POST',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    await expect(likeTweetByIdGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'id is a required field' },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });

  it('should handle missing tweet id parameter on unlike', async () => {
    const event = createMockH3Event(
      {
        method: 'DELETE',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );
    await expect(unLikeTweetByIdGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'id is a required field' },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
