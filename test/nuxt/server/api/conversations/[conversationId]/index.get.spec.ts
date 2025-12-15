import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/conversations/[conversationId]/index.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should fetch a single conversation by id', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/index.get'
    );

    const mockResponse = {
      success: true,
      data: {
        id: 'conv-123',
        participant: { username: 'testuser', displayName: 'Test User' },
      },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-123' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-123');
    expect(response).toEqual(mockResponse);
  });

  it('should handle different conversation ids', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/index.get'
    );

    const mockResponse = {
      success: true,
      data: { id: 'conv-456' },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-456' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-456');
    expect(response.data.id).toBe('conv-456');
  });
});
