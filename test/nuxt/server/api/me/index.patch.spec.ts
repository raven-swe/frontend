import { beforeEach, describe, expect, it, vi } from 'vitest';
import mePatchHandler from '~~/server/api/me/index.patch';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PATCH /api/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user data successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Updated user successfully',
    });
    const event = createMockH3Event(
      {
        body: { name: 'Updated User' },
      },
      {},
    );
    const response = await mePatchHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me', {
      method: 'PATCH',
      body: { name: 'Updated User' },
    });
    expect(response).toEqual({
      success: true,
      message: 'Updated user successfully',
    });
  });
});
