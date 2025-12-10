import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import forYouEventHandler from '~~/server/api/explore/for-you.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/explore/for-you', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns categorized tweets successfully', async () => {
    const mockResponse = {
      data: {
        categories: [
          {
            category: 'Technology',
            tweets: [
              {
                id: '1',
                text: 'Tech tweet',
                user: {
                  id: '1',
                  name: 'Tech User',
                  username: 'techuser',
                },
              },
            ],
          },
          {
            category: 'Sports',
            tweets: [
              {
                id: '2',
                text: 'Sports tweet',
                user: {
                  id: '2',
                  name: 'Sports User',
                  username: 'sportsuser',
                },
              },
            ],
          },
        ],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await forYouEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/for-you', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
    expect(response.data.categories).toHaveLength(2);
    expect(response.data.categories[0]).toHaveProperty('category');
    expect(response.data.categories[0]).toHaveProperty('tweets');
  });

  it('handles empty categorized tweets response', async () => {
    const mockResponse = {
      data: {
        categories: [],
      },
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await forYouEventHandler(event);

    expect(response).toEqual(mockResponse);
    expect(response.data.categories).toHaveLength(0);
  });

  it('handles server error', async () => {
    const mockError = new Error('Server error');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(forYouEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
