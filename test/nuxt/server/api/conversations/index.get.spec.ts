import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/conversations/index.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should fetch conversations with default limit', async () => {
    const { default: handler } = await import('~~/server/api/conversations/index.get');

    const mockResponse = {
      success: true,
      data: [
        { id: 'conv-1', participant: { username: 'user1' } },
        { id: 'conv-2', participant: { username: 'user2' } },
      ],
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {},
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations', {
      method: 'GET',
      query: {
        cursor: undefined,
        limit: 20,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should fetch conversations with cursor', async () => {
    const { default: handler } = await import('~~/server/api/conversations/index.get');

    const mockResponse = {
      success: true,
      data: [{ id: 'conv-3' }],
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: { cursor: 'cursor-123' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations', {
      method: 'GET',
      query: {
        cursor: 'cursor-123',
        limit: 20,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should fetch conversations with custom limit', async () => {
    const { default: handler } = await import('~~/server/api/conversations/index.get');

    const mockResponse = {
      success: true,
      data: [],
      pagination: { hasNextPage: false },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: { limit: 10 },
    });

    await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations', {
      method: 'GET',
      query: {
        cursor: undefined,
        limit: 10,
      },
    });
  });

  it('should handle pagination response', async () => {
    const { default: handler } = await import('~~/server/api/conversations/index.get');

    const mockResponse = {
      success: true,
      data: [{ id: 'conv-1' }],
      pagination: { hasNextPage: true, nextCursor: 'next-cursor' },
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      query: {},
    });

    const response = await handler(event);

    expect(response.pagination.hasNextPage).toBe(true);
    expect(response.pagination.nextCursor).toBe('next-cursor');
  });
});
