import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import retweetByIdPostHandler from '~~/server/api/tweets/[id]/retweet/index.post';
import unRetweetByIdDeleteHandler from '~~/server/api/tweets/[id]/retweet/index.delete';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('POST /api/tweets/[id]/retweet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retweet by id successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'retweeted successfully',
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

    const response = await retweetByIdPostHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/retweet', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'retweeted successfully',
    });
  });

  it('should unretweet by id successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'unretweeted successfully',
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

    const response = await unRetweetByIdDeleteHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/retweet', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'unretweeted successfully',
    });
  });

  it('should handle missing tweet id parameter on retweet', async () => {
    const event = createMockH3Event(
      {
        method: 'POST',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    await expect(retweetByIdPostHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'id is a required field' },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });

  it('should handle missing tweet id parameter on unretweet', async () => {
    const event = createMockH3Event(
      {
        method: 'DELETE',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    await expect(unRetweetByIdDeleteHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'id is a required field' },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
