import { describe, expect, vi, it, beforeEach } from 'vitest';
import usernameSuggestionsHandler from '~~/server/api/settings/username/suggestions.get';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

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
    });

    const response = await usernameSuggestionsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/onboarding/username-suggestions', {
      method: 'GET',
      headers: {},
    });

    expect(response).toEqual({
      success: true,
      data: { suggestions: ['john_doe', 'johndoe1'] },
    });
  });

  it('should forward Authorization header to backend', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      data: { suggestions: ['john_doe', 'johndoe1'] },
    });

    const event = createMockH3Event({
      method: 'GET',
    });

    event.headers.set('Authorization', 'Bearer mock-token');

    const response = await usernameSuggestionsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/onboarding/username-suggestions', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      data: { suggestions: ['john_doe', 'johndoe1'] },
    });
  });
});
