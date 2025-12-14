import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/conversations/[conversationId]/messages/[messageId]/index.delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should delete a message successfully', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/[messageId]/index.delete'
    );

    const mockResponse = {
      success: true,
      message: 'Message deleted successfully',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'DELETE',
      params: { conversationId: 'conv-123', messageId: 'msg-456' },
    });

    const response = await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/conversations/conv-123/messages/msg-456', {
      method: 'DELETE',
    });
    expect(response).toEqual(mockResponse);
  });

  it('should handle errors during deletion', async () => {
    const { default: handler } = await import(
      '~~/server/api/conversations/[conversationId]/messages/[messageId]/index.delete'
    );

    const mockError = new Error('Failed to delete message');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'DELETE',
      params: { conversationId: 'conv-123', messageId: 'msg-456' },
    });

    await expect(handler(event)).rejects.toThrow('Failed to delete message');
  });
});
