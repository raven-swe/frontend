import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
const mockSendStream = vi.fn();
const mockSetHeader = vi.fn();

vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);
vi.stubGlobal('sendStream', mockSendStream);
vi.stubGlobal('setHeader', mockSetHeader);

describe('server/api/stream.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should forward SSE stream from upstream', async () => {
    const { default: handler } = await import('~~/server/api/stream.get');

    const mockStream = new ReadableStream();
    mockServerApiFetch.mockResolvedValueOnce(mockStream);

    const event = createMockH3Event({
      method: 'GET',
      query: { token: 'test-token' },
    });

    await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/stream', {
      method: 'GET',
      query: { token: 'test-token' },
      headers: {
        Accept: 'text/event-stream',
      },
      responseType: 'stream',
    });
  });

  it('should set correct SSE response headers', async () => {
    const { default: handler } = await import('~~/server/api/stream.get');

    const mockStream = new ReadableStream();
    mockServerApiFetch.mockResolvedValueOnce(mockStream);

    const event = createMockH3Event({
      method: 'GET',
      query: {},
    });

    await handler(event);

    expect(mockSetHeader).toHaveBeenCalledWith(event, 'Content-Type', 'text/event-stream');
    expect(mockSetHeader).toHaveBeenCalledWith(event, 'Cache-Control', 'no-cache, no-transform');
    expect(mockSetHeader).toHaveBeenCalledWith(event, 'Connection', 'keep-alive');
    expect(mockSetHeader).toHaveBeenCalledWith(event, 'X-Accel-Buffering', 'no');
  });

  it('should send stream to client', async () => {
    const { default: handler } = await import('~~/server/api/stream.get');

    const mockStream = new ReadableStream();
    mockServerApiFetch.mockResolvedValueOnce(mockStream);

    const event = createMockH3Event({
      method: 'GET',
      query: {},
    });

    await handler(event);

    expect(mockSendStream).toHaveBeenCalledWith(event, mockStream);
  });

  it('should pass query parameters to upstream', async () => {
    const { default: handler } = await import('~~/server/api/stream.get');

    const mockStream = new ReadableStream();
    mockServerApiFetch.mockResolvedValueOnce(mockStream);

    const event = createMockH3Event({
      method: 'GET',
      query: {
        token: 'auth-token',
        lastEventId: 'event-123',
      },
    });

    await handler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/stream', {
      method: 'GET',
      query: {
        token: 'auth-token',
        lastEventId: 'event-123',
      },
      headers: {
        Accept: 'text/event-stream',
      },
      responseType: 'stream',
    });
  });
});
