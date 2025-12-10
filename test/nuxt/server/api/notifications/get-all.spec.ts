import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import notificationsGetHandler from '~~/server/api/notifications/index.get';
import { createError } from '#imports';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import type { Notification } from '~~/shared/types/notifications';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all notifications successfully', async () => {
    const sampleNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'MENTION',
        latestEventAt: new Date().toISOString(),
        actorSummary: {
          previewActors: [{ username: 'alice', displayName: 'Alice', avatarUrl: '' }],
        },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't1', content: 'hi' } },
      } as Notification,
    ];

    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'fetched notifications successfully',
      data: sampleNotifications,
    });

    const event = createMockH3Event({ method: 'GET' });

    const response = await notificationsGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications', {
      method: 'GET',
      query: {},
    });

    expect(response).toEqual({
      success: true,
      message: 'fetched notifications successfully',
      data: sampleNotifications,
    });
  });

  it('should handle API fetch failure', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'notifications not found',
      data: { message: 'notifications not found', success: false },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);

    const event = createMockH3Event({ method: 'GET' });

    await expect(notificationsGetHandler(event)).rejects.toEqual(backendError);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications', {
      method: 'GET',
      query: {},
    });
  });

  it('should handle non api errors', async () => {
    mockServerApiFetch.mockRejectedValueOnce(new Error('Network Error'));

    const event = createMockH3Event({ method: 'GET' });

    await expect(notificationsGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'Network Error' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/notifications', {
      method: 'GET',
      query: {},
    });
  });
});
