import { beforeEach, describe, expect, it, vi } from 'vitest';
import meGetHandler from '~~/server/api/me/index.get';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch current user data successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'User data fetched successfully',
      data: { id: 'user123', name: 'Test User' },
    });
    const event = createMockH3Event({}, {});
    const response = await meGetHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me');
    expect(response).toEqual({
      success: true,
      message: 'User data fetched successfully',
      data: { id: 'user123', name: 'Test User' },
    });
  });
});
