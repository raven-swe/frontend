import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import indexPutEventHandler from '~~/server/api/settings/email/index.put';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PUT /api/settings/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Email update initiated',
    });
    const event = createMockH3Event({
      method: 'PUT',
      body: {
        newEmail: 'newemail@example.com',
      },
    });
    const response = await indexPutEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/email', {
      method: 'PUT',
      body: {
        newEmail: 'newemail@example.com',
      },
    });
    expect(response).toEqual({
      success: true,
      message: 'Email update initiated',
    });
  });
});
