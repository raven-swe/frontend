import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import usersSuggestionsSearchEventHandler from '~~/server/api/search/users/suggestions.get';
import type { CompactUser } from '~~/shared/types/user';
import type { ApiSuccessResponse } from '~~/shared/types/api';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/search/users/suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns users suggestions search results with query', async () => {
    const mockResponse: ApiSuccessResponse<CompactUser[]> = {
      success: true,
      data: [
        {
          username: 'johndoe',
          displayName: 'John Doe',
          avatarUrl: 'https://example.com/avatar1.jpg',
          bio: 'Software developer',
          relationship: {
            following: true,
            follower: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
          avatarUrl: 'https://example.com/avatar2.jpg',
          bio: 'Designer',
          bioEntities: {},
          relationship: {
            following: false,
            follower: true,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'doe',
      },
    });

    const response = await usersSuggestionsSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/users/suggestions', {
      method: 'GET',
      query: {
        query: 'doe',
      },
    });
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toHaveProperty('username');
    expect(response.data[0]).toHaveProperty('displayName');
    expect(response.data[0]).toHaveProperty('relationship');
  });

  it('handles empty search results', async () => {
    const mockResponse: ApiSuccessResponse<CompactUser[]> = {
      success: true,
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'nonexistentuser',
      },
    });

    const response = await usersSuggestionsSearchEventHandler(event);

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(0);
  });

  it('handles server error', async () => {
    const mockError = new Error('Server error');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'test',
      },
    });

    await expect(usersSuggestionsSearchEventHandler(event)).rejects.toThrow(
      'Internal Server Error',
    );
  });
});
