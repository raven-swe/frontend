import { describe, expect, vi, it, beforeEach } from 'vitest';
import usernameSuggestionsHandler from '~~/server/api/settings/username/suggestions.get';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/settings/username/suggestions.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and suggestions for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      data: { suggestions: ['john_doe', 'johndoe1'] },
    });

    const event = createMockH3Event({
      method: 'GET',
      query: {
        baseUsername: 'ahmedamr',
      },
    });

    const response = await usernameSuggestionsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith(`/onboarding/username-suggestions`, {
      method: 'GET',
      query: {
        typed: 'ahmedamr',
      },
    });

    expect(response).toEqual({
      success: true,
      data: { suggestions: ['john_doe', 'johndoe1'] },
    });
  });
});
