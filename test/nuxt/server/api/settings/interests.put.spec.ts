import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import interestsHandler from '~~/server/api/settings/interests/index.put';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PUT /settings/interests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('sucessfully updates user interests', async () => {
    const mockResponse = {
      success: true,
      message: 'Interests updated successfully',
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'PUT',
      body: { interests: ['NEWS', 'MUSIC'] },
    });

    const response = await interestsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/interests', {
      method: 'PUT',
      body: { interests: ['NEWS', 'MUSIC'] },
    });
    expect(response).toMatchObject(mockResponse);
  });
});
