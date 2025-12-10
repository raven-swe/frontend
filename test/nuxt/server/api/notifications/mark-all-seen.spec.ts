import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import seenPatchHandler from '~~/server/api/notifications/seen.patch';
import { createError, type Notification } from '#imports';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PATCH /api/notifications/seen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark all notifications seen successfully', async () => {
    const sampleNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'MENTION',
        latestEventAt: new Date().toISOString(),
        actorSummary: {
          previewActors: [{ username: 'alice', displayName: 'Alice', avatarUrl: '' }],
        },
        isSeen: true,
        tweetSummary: { primaryTweet: { id: 't1', content: 'hi' } },
      } as Notification,
    ];

    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'marked seen',
      data: sampleNotifications,
    });

    const event = createMockH3Event({
      method: 'PATCH',
    });

    const response = await seenPatchHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications/seen', {
      method: 'PATCH',
    });

    expect(response).toEqual({
      success: true,
      message: 'marked seen',
      data: sampleNotifications,
    });
  });

  it('should forward API errors from backend', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'not found',
      data: { message: 'endpoint not found', success: false },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);

    const event = createMockH3Event({
      method: 'PATCH',
    });

    await expect(seenPatchHandler(event)).rejects.toEqual(backendError);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications/seen', {
      method: 'PATCH',
    });
  });

  it('should wrap non-api errors into 500 createError', async () => {
    mockServerApiFetch.mockRejectedValueOnce(new Error('Network Error'));

    const event = createMockH3Event({
      method: 'PATCH',
    });

    await expect(seenPatchHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'Network Error' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications/seen', {
      method: 'PATCH',
    });
  });
});
