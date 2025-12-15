import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/conversations/[conversationId]/messages/index.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should fetch messages for a conversation with default limit', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/index.get'
    );

    const mockResponse = {
      success: true,
      data: {
        messages: [
          { id: 'msg-1', content: 'Hello' },
          { id: 'msg-2', content: 'Hi there' },
        ],
      },
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-123' },
      query: {},
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-123/messages', {
      method: 'GET',
      query: {
        cursor: undefined,
        limit: 20,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should fetch messages with cursor for pagination', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/index.get'
    );

    const mockResponse = {
      success: true,
      data: { messages: [{ id: 'msg-3' }] },
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-123' },
      query: { cursor: 'msg-cursor-456' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-123/messages', {
      method: 'GET',
      query: {
        cursor: 'msg-cursor-456',
        limit: 20,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should fetch messages with custom limit', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/index.get'
    );

    const mockResponse = {
      success: true,
      data: { messages: [] },
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-123' },
      query: { limit: 50 },
    });

    await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-123/messages', {
      method: 'GET',
      query: {
        cursor: undefined,
        limit: 50,
      },
    });
  });

  it('should handle pagination with hasNextPage true', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/index.get'
    );

    const mockResponse = {
      success: true,
      data: { messages: [{ id: 'msg-1' }] },
      pagination: { hasNextPage: true, nextCursor: 'next-msg-cursor' },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { conversationId: 'conv-123' },
      query: {},
    });

    const response = await handler(event);

    expect(response.pagination.hasNextPage).toBe(true);
    expect(response.pagination.nextCursor).toBe('next-msg-cursor');
  });
});
