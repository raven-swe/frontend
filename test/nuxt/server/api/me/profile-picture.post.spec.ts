import { beforeEach, describe, expect, it, vi } from 'vitest';
import profilePicturePostHandler from '~~/server/api/me/profile-picture.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/me/profile-picture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user profile-picture successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Updated user successfully',
    });
    const event = createMockH3Event(
      {
        body: { 'profile-picture': 'Updated profile-picture' },
      },
      {
        'content-type': 'application/json',
      },
    );
    const response = await profilePicturePostHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/profile-picture', {
      method: 'POST',
      body: event.node.req,
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(response).toEqual({
      success: true,
      message: 'Updated user successfully',
    });
  });
});
