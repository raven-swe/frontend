import { describe, it, expect, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import followingEventHandler from '~~/server/api/timeline/following.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('GET /api/timeline/following', () => {
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
      query: {
        limit: 20,
        cursor: '0',
      },
    });

    const response = await followingEventHandler(event);

    expect(response).toEqual(mockResponse);
  });
});
