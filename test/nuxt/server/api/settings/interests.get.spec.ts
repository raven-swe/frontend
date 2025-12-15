import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import interestsHandler from '~~/server/api/settings/interests/index.get';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /settings/interests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns user interests', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          code: 'NEWS',
          name: 'News',
          isSelected: false,
        },
      ],
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await interestsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/interests', {
      method: 'GET',
    });
    expect(response).toMatchObject(mockResponse);
  });
});
