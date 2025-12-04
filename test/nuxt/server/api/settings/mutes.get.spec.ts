import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import mutesHandler from '~~/server/api/settings/mutes.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /settings/mutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user mutes', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
        },
      ],
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        cursor: 'abc123',
        limit: '10',
      },
    });

    const response = await mutesHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/mutes', {
      method: 'GET',
      query: { cursor: 'abc123', limit: '10' },
    });
    expect(response).toMatchObject({
      ...mockResponse,
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
          relationship: {
            blocking: false,
            blockedBy: false,
            muted: true,
            following: false,
            follower: false,
          },
        },
      ],
    });
  });
});
