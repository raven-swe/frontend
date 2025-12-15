import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import usersSearchEventHandler from '~~/server/api/search/users/index.get';
import type { CompactUser } from '~~/shared/types/user';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/search/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns users search results with all query parameters', async () => {
    const mockResponse: ApiSuccessResponse<{ users: CompactUser[] }> = {
      success: true,
      data: {
        users: [
          {
            username: 'johndoe',
            fullName: 'John Doe',
            profileImageUrl: 'https://example.com/avatar1.jpg',
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
            fullName: 'Jane Doe',
            profileImageUrl: 'https://example.com/avatar2.jpg',
            bio: 'Designer',
            relationship: {
              following: false,
              follower: true,
              blocking: false,
              blockedBy: false,
              muted: false,
            },
          },
        ],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'doe',
        limit: '10',
        cursor: 'xyz789',
        peopleFilter: 'you-follow',
        excludeMutedAndBlocked: 'true',
      },
    });

    const response = await usersSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/users', {
      method: 'GET',
      query: {
        query: 'doe',
        limit: '10',
        cursor: 'xyz789',
        peopleFilter: 'you-follow',
        excludeMutedAndBlocked: 'true',
      },
    });
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toHaveProperty('username');
    expect(response.data[0]).toHaveProperty('fullName');
    expect(response.data[0]).toHaveProperty('relationship');
  });

  it('returns users search results with minimal query parameters', async () => {
    const mockResponse: ApiSuccessResponse<{ users: CompactUser[] }> = {
      success: true,
      data: {
        users: [
          {
            username: 'testuser',
            fullName: 'Test User',
            profileImageUrl: 'https://example.com/avatar.jpg',
            bio: 'Test bio',
            relationship: {
              following: false,
              follower: false,
              blocking: false,
              blockedBy: false,
              muted: false,
            },
          },
        ],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'test',
      },
    });

    const response = await usersSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/users', {
      method: 'GET',
      query: {
        query: 'test',
        limit: undefined,
        cursor: undefined,
        peopleFilter: undefined,
        excludeMutedAndBlocked: undefined,
      },
    });
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
  });

  it('handles empty search results', async () => {
    const mockResponse: ApiSuccessResponse<{ users: CompactUser[] }> = {
      success: true,
      data: {
        users: [],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'nonexistentuser',
      },
    });

    const response = await usersSearchEventHandler(event);

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(0);
  });

  it('handles cursor parameter correctly when undefined', async () => {
    const mockResponse: ApiSuccessResponse<{ users: CompactUser[] }> = {
      success: true,
      data: {
        users: [],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'test',
        cursor: undefined,
      },
    });

    await usersSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/users', {
      method: 'GET',
      query: expect.objectContaining({
        cursor: undefined,
      }),
    });
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

    await expect(usersSearchEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
