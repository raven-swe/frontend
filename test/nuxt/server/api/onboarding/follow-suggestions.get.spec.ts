import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import followSuggestionsHandler from '~~/server/api/onboarding/follow-suggestions.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /onboarding/follow-suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user follow suggestions', async () => {
    const mockResponse = {
      success: true,
      data: {
        suggestions: [
          {
            id: '1',
            username: 'user1',
            displayName: 'User One',
            avatarUrl: 'http://example.com/avatar1.png',
            bio: 'Bio of user one',
            bioEntities: null,
            relationship: { isFollower: true },
          },
          {
            id: '2',
            username: 'user2',
            displayName: 'User Two',
            avatarUrl: 'http://example.com/avatar2.png',
            bio: 'Bio of user two',
            bioEntities: null,
            relationship: { isFollower: false },
          },
        ],
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        cursor: 'abc123',
        limit: '10',
      },
    });

    const response = await followSuggestionsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/onboarding/follow-suggestions', {
      method: 'GET',
      query: { cursor: 'abc123', limit: '10' },
    });
    expect(response).toMatchObject({
      data: [
        {
          username: 'user1',
          displayName: 'User One',
          avatarUrl: 'http://example.com/avatar1.png',
          bio: 'Bio of user one',
          bioEntities: null,
          relationship: {
            follower: true,
            following: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
        {
          username: 'user2',
          displayName: 'User Two',
          avatarUrl: 'http://example.com/avatar2.png',
          bio: 'Bio of user two',
          bioEntities: null,
          relationship: {
            follower: false,
            following: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
      ],
    });
  });
});
