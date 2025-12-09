import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import topSearchEventHandler from '~~/server/api/search/hashtags/top.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/search/hashtags/top', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns top search results successfully', async () => {
    const mockResponse: ApiSuccessResponse<string[]> = {
      data: ['javascript', 'typescript', 'nodejs'],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: 'java',
      },
    });

    const response = await topSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/top', {
      method: 'GET',
      query: {
        query: 'java',
      },
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(3);
  });

  it('handles empty search results', async () => {
    const mockResponse: ApiSuccessResponse<string[]> = {
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

    const response = await topSearchEventHandler(event);

    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(0);
  });

  it('handles search with empty query parameter', async () => {
    const mockResponse: ApiSuccessResponse<string[]> = {
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        query: '',
      },
    });

    const response = await topSearchEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/search/top', {
      method: 'GET',
      query: {
        query: '',
      },
    });
    expect(response).toEqual(mockResponse);
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

    await expect(topSearchEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
