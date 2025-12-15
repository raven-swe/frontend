import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/conversations/with/[username]/index.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should start a conversation with a user by username', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/with/[username]/index.post'
    );

    const mockResponse = {
      success: true,
      data: {
        id: 'new-conv-123',
        participant: { username: 'testuser', displayName: 'Test User' },
      },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'POST',
      params: { username: 'testuser' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/with/testuser', {
      method: 'POST',
    });
    expect(response).toEqual(mockResponse);
  });

  it('should handle different usernames', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/with/[username]/index.post'
    );

    const mockResponse = {
      success: true,
      data: { id: 'conv-456', participant: { username: 'anotheruser' } },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'POST',
      params: { username: 'anotheruser' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/with/anotheruser', {
      method: 'POST',
    });
    expect(response.data.participant.username).toBe('anotheruser');
  });

  it('should return existing conversation if already exists', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/with/[username]/index.post'
    );

    const mockResponse = {
      success: true,
      data: {
        id: 'existing-conv-789',
        participant: { username: 'existinguser' },
        lastMessage: { content: 'Previous message' },
      },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'POST',
      params: { username: 'existinguser' },
    });

    const response = await handler(event);

    expect(response.data.id).toBe('existing-conv-789');
    expect(response.data.lastMessage.content).toBe('Previous message');
  });
});
