import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import tweetSummaryGetHandler from '~~/server/api/tweets/[id]/summary/index.get';
import { createError } from '#imports';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/tweets/[id]/summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch AI summary by tweet id successfully', async () => {
    const summaryResponse = {
      success: true,
      message: 'fetched summary successfully',
      data: { id: '1', summary: 'This is an AI-generated summary.' },
    };

    mockServerApiFetch.mockResolvedValueOnce(summaryResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    const response = await tweetSummaryGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/summary', {
      method: 'GET',
    });

    expect(response).toEqual(summaryResponse);
  });

  it('should handle API fetch failure', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'summary not found',
      data: { message: 'summary not found', success: false },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);

    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    await expect(tweetSummaryGetHandler(event)).rejects.toEqual(backendError);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/summary', {
      method: 'GET',
    });
  });

  it('should handle non api errors', async () => {
    mockServerApiFetch.mockRejectedValueOnce(new Error('Network Error'));

    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    await expect(tweetSummaryGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'Network Error' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1/summary', {
      method: 'GET',
    });
  });

  it('should handle missing tweet id parameter', async () => {
    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(tweetSummaryGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          message: 'id is a required field',
          errors: ['id is a required field'],
        },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
