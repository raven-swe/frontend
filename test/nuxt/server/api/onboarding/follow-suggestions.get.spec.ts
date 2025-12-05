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
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
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

    const response = await followSuggestionsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/onboarding/follow-suggestions', {
      method: 'GET',
      query: { cursor: 'abc123', limit: '10' },
    });
    expect(response).toMatchObject(mockResponse);
  });
});
