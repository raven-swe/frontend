import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import blocksHandler from '~~/server/api/settings/blocks.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /settings/blocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user blocks', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
          relationship: {
            blocking: true,
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
      query: {
        cursor: 'abc123',
        limit: '10',
      },
    });

    const response = await blocksHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/blocks', {
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
            blocking: true,
            blockedBy: false,
            muted: false,
            following: false,
            follower: false,
          },
        },
      ],
    });
  });
});
