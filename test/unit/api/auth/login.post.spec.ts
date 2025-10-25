import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
  body?: unknown;
};

const makeEvent = (body: unknown = {}) => ({
  context: {},
  req: {},
  res: {},
  node: {},
  body,
});

declare global {
  var defineEventHandler: <T extends (...args: unknown[]) => unknown>(handler: T) => T;
  var createError: (input: {
    statusCode?: number;
    statusMessage?: string;
    data?: unknown;
  }) => Error & { statusCode?: number; statusMessage?: string; data?: unknown };
  var serverApiFetch: ReturnType<typeof vi.fn>;
  var readBody: (event: MockEvent) => unknown;
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
    err.statusCode = statusCode;
    err.statusMessage = statusMessage;
    err.data = data;
    return err;
  });
  vi.stubGlobal('readBody', (event: MockEvent) => event.body);
  fetchMock = vi.fn();
  vi.stubGlobal('serverApiFetch', { raw: fetchMock });
  vi.stubGlobal('appendHeader', (event: MockEvent, name: string, value: string) => {
    if (!event.res.headers) {
      event.res.headers = {};
    }
    if (!event.res.headers[name]) {
      event.res.headers[name] = [];
    }
    (event.res.headers[name] as string[]).push(value);
  });
  process.env.BACKEND_URL = 'https://api.example.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/auth/login', () => {
  it('returns tokens on success', async () => {
    const mockResponse = {
      _data: {
        success: true,
        data: { accessToken: 'abc', refreshToken: 'xyz' },
      },
      headers: {
        getSetCookie: () => ['refresh_token=xyz; Path=/; HttpOnly; Secure; SameSite=Lax'],
      },
    };
    fetchMock.mockResolvedValueOnce(mockResponse);

    const handler = (await import('../../../../server/api/auth/login.post')).default;
    const res = await handler(makeEvent({ identifier: 'test', password: 'pass' }));

    expect(fetchMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { identifier: 'test', password: 'pass' },
      credentials: 'include',
    });
    expect(res).toEqual(mockResponse._data);
  });

  it('throws validation error (422)', async () => {
    const validationError = {
      statusCode: 422,
      statusMessage: 'Missing required fields',
      message: 'Missing required fields',
      data: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields',
      },
    };
    fetchMock.mockRejectedValueOnce(validationError);

    const handler = (await import('../../../../server/api/auth/login.post')).default;
    await expect(handler(makeEvent({}))).rejects.toMatchObject({
      statusCode: 422,
      statusMessage: 'Missing required fields',
      data: validationError.data,
    });
  });

  it('throws unauthorized error (401)', async () => {
    const unauthorizedError = {
      statusCode: 401,
      statusMessage: 'Invalid credentials',
      message: 'Invalid credentials',
      data: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      },
    };
    fetchMock.mockRejectedValueOnce(unauthorizedError);

    const handler = (await import('../../../../server/api/auth/login.post')).default;
    await expect(handler(makeEvent({}))).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
      data: unauthorizedError.data,
    });
  });

  it('throws generic 500 with backend error', async () => {
    const backendError = {
      statusCode: 500,
      statusMessage: 'Server issue',
      message: 'Server issue',
      data: { code: 'SOMETHING_WRONG', message: 'Server issue' },
    };
    fetchMock.mockRejectedValueOnce(backendError);

    const handler = (await import('../../../../server/api/auth/login.post')).default;
    await expect(handler(makeEvent({}))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Server issue',
      data: backendError.data,
    });
  });
});
