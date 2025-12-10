import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import tweetsSearchEventHandler from '~~/server/api/search/tweets.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/search/tweets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns tweets search results with all query parameters', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          text: 'Test tweet about JavaScript',
          user: {
            id: '1',
            name: 'John Doe',
            username: 'johndoe',
          },
        },
        {
          id: '2',
          text: 'Another JavaScript tweet',
          user: {
            id: '2',
            name: 'Jane Smith',
            username: 'janesmith',
          },
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'JavaScript',
        tab: 'latest',
        limit: '20',
        cursor: 'abc123',
        peopleFilter: 'you-follow',
        excludeMutedAndBlocked: 'true',
      },
    });

    const response = await tweetsSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/tweets', {
      method: 'GET',
      query: {
        query: 'JavaScript',
        tab: 'latest',
        limit: '20',
        cursor: 'abc123',
        peopleFilter: 'you-follow',
        excludeMutedAndBlocked: 'true',
      },
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(2);
  });

  it('returns tweets search results with minimal query parameters', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          text: 'Test tweet',
          user: {
            id: '1',
            name: 'User',
            username: 'user',
          },
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'test',
      },
    });

    const response = await tweetsSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/tweets', {
      method: 'GET',
      query: {
        query: 'test',
        tab: undefined,
        limit: undefined,
        cursor: undefined,
        peopleFilter: undefined,
        excludeMutedAndBlocked: undefined,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('handles empty search results', async () => {
    const mockResponse = {
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'nonexistent',
      },
    });

    const response = await tweetsSearchEventHandler(event);

    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(0);
  });

  it('handles cursor parameter correctly when undefined', async () => {
    const mockResponse = {
      data: [],
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

    await tweetsSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/tweets', {
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

    await expect(tweetsSearchEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
