import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock FetchError class used in handlers
vi.mock('ofetch', () => {
  class MockFetchError extends Error {
    data?: unknown;
    status?: number;
    constructor(message: string, data?: unknown, status?: number) {
      super(message);
      this.name = 'FetchError';
      this.data = data;
      this.status = status;
    }
  }
  return { FetchError: MockFetchError };
});

type MockEvent = {
  context: Record<string, unknown>;
  req: Record<string, unknown>;
  res: Record<string, unknown>;
  node: Record<string, unknown>;
  query: Record<string, string>;
};

const makeEvent = (query: Record<string, string> = {}) => ({
  context: {},
  req: {},
  res: {},
  node: {},
  // simulate getQuery
  query,
});

declare global {
  var defineEventHandler: <T extends (...args: unknown[]) => unknown>(handler: T) => T;
  var createError: (input: {
    statusCode?: number;
    statusMessage?: string;
    data?: unknown;
  }) => Error & { statusCode?: number; statusMessage?: string; data?: unknown };
  var $fetch: ReturnType<typeof vi.fn>;
  var getQuery: (event: MockEvent) => Record<string, string>;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();

  vi.stubGlobal('defineEventHandler', ((fn) => fn) as unknown);
  vi.stubGlobal('createError', ({ statusCode, statusMessage, data }) => {
    const err = new Error(statusMessage) as Error & {
      statusCode?: number;
      statusMessage?: string;
      data?: unknown;
    };
    err.name = 'HTTPError';
    err.statusCode = statusCode;
    err.statusMessage = statusMessage;
    err.data = data;
    return err;
  });
  vi.stubGlobal('getQuery', (event: MockEvent) => event.query);
  fetchMock = vi.fn();
  vi.stubGlobal('$fetch', fetchMock);
  process.env.BACKEND_URL = 'https://api.example.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /api/auth/check-identifier', () => {
  it('returns success response when identifier exists', async () => {
    const mockResponse = { success: true, data: { exists: true, type: 'email' } };
    fetchMock.mockResolvedValueOnce(mockResponse);

    const handler = (await import('../../../../server/api/auth/check-identifier.get')).default;
    const res = await handler(makeEvent({ identifier: 'test@example.com' }));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/auth/check-identifier?identifier=test%40example.com',
      { method: 'GET' },
    );
    expect(res).toEqual(mockResponse);
  });

  it('maps FetchError with backend error message', async () => {
    const { FetchError } = await import('ofetch');
    const backendError = {
      error: { message: 'User not found', code: 'NOT_FOUND' },
    };
    fetchMock.mockRejectedValueOnce(new FetchError('fail', backendError, 404));

    const handler = (await import('../../../../server/api/auth/check-identifier.get')).default;

    await expect(handler(makeEvent({ identifier: 'unknown' }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'User not found',
      data: backendError.error,
    });
  });

  it('uses default Internal Server Error when FetchError has no data', async () => {
    const { FetchError } = await import('ofetch');
    fetchMock.mockRejectedValueOnce(new FetchError('fail', undefined, 503));

    const handler = (await import('../../../../server/api/auth/check-identifier.get')).default;

    await expect(handler(makeEvent({ identifier: 'abc' }))).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: 'Internal Server Error',
    });
  });

  it('maps unknown errors to 500 with message', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Boom'));

    const handler = (await import('../../../../server/api/auth/check-identifier.get')).default;

    await expect(handler(makeEvent({ identifier: 'xyz' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Boom',
    });
  });
});
