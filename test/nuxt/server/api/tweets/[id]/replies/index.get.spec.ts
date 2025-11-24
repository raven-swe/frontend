import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from '#app';
import repliesEventHandler from '~~/server/api/tweets/[id]/replies/index.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/tweets/[id]/replies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success response with tweets data', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          text: 'Hello world!',
          user: {
            id: '1',
            name: 'User 1',
            username: 'user1',
          },
        },
      ],
      pagination: {
        next: null,
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { id: '123' },
      query: {
        limit: 20,
        cursor: '0',
      },
    });

    const response = await repliesEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/123/replies', {
      method: 'GET',
      query: {
        limit: 20,
        cursor: '0',
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('throws error for missing id parameter', async () => {
    const event = createMockH3Event({
      method: 'GET',
      query: {
        limit: 20,
        cursor: '0',
      },
    });

    await expect(repliesEventHandler(event)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['id is a required field'],
          message: 'id is a required field',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });

  it('throws error for empty id parameter', async () => {
    const event = createMockH3Event({
      method: 'GET',
      params: { id: '' },
      query: {
        limit: 20,
        cursor: '0',
      },
    });

    await expect(repliesEventHandler(event)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['id is a required field'],
          message: 'id is a required field',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
