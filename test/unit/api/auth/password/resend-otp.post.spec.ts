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
  var $fetch: ReturnType<typeof vi.fn>;
  var readBody: (event: MockEvent) => unknown;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();

  vi.stubGlobal('defineEventHandler', ((fn: unknown) => fn) as unknown);
  vi.stubGlobal(
    'createError',
    ({
      statusCode,
      statusMessage,
      data,
    }: {
      statusCode?: number;
      statusMessage?: string;
      data?: unknown;
    }) => {
      const err = new Error(statusMessage) as Error & {
        statusCode?: number;
        statusMessage?: string;
        data?: unknown;
      };
      err.statusCode = statusCode;
      err.statusMessage = statusMessage;
      err.data = data;
      return err;
    },
  );
  vi.stubGlobal('readBody', (event: MockEvent) => event.body);
  fetchMock = vi.fn();
  vi.stubGlobal('$fetch', fetchMock);
  process.env.BACKEND_URL = 'https://api.example.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/auth/password/resend-otp', () => {
  it('returns success response when OTP is resent', async () => {
    const mockResponse = {
      success: true,
      message: 'otp resent successfully.',
    };
    fetchMock.mockResolvedValueOnce(mockResponse);

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    const res = await handler(makeEvent({ confirmationToken: 'token123' }));

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/auth/password/resend-otp', {
      method: 'POST',
      body: { confirmationToken: 'token123' },
    });
    expect(res).toEqual(mockResponse);
  });

  it('throws validation error (422) when token is missing', async () => {
    const { FetchError } = await import('ofetch');
    const validationError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        errors: [{ field: 'confirmationToken', message: 'Token is required' }],
      },
    };
    // @ts-expect-error - Mock FetchError accepts 3 parameters
    fetchMock.mockRejectedValueOnce(new FetchError('Validation failed', validationError, 422));

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({}))).rejects.toMatchObject({
      statusCode: 422,
      statusMessage: 'Validation error',
      data: validationError.error,
    });
  });

  it('throws error (400) when token is invalid', async () => {
    const { FetchError } = await import('ofetch');
    const invalidTokenError = {
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    };
    // @ts-expect-error - Mock FetchError accepts 3 parameters
    fetchMock.mockRejectedValueOnce(new FetchError('Invalid token', invalidTokenError, 400));

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({ confirmationToken: 'invalid_token' }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid or expired token',
      data: invalidTokenError.error,
    });
  });

  it('throws 500 error when backend fails', async () => {
    const { FetchError } = await import('ofetch');
    const serverError = {
      error: { code: 'INTERNAL_ERROR', message: 'Server error' },
    };
    // @ts-expect-error - Mock FetchError accepts 3 parameters
    fetchMock.mockRejectedValueOnce(new FetchError('Server failed', serverError, 500));

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({ confirmationToken: 'token123' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Server error',
      data: serverError.error,
    });
  });

  it('uses default status 500 when FetchError has no status', async () => {
    const { FetchError } = await import('ofetch');
    // @ts-expect-error - Mock FetchError accepts 3 parameters
    fetchMock.mockRejectedValueOnce(new FetchError('fail', undefined, undefined));

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({ confirmationToken: 'token123' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  });

  it('throws fallback 500 for non-FetchError exceptions', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network timeout'));

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({ confirmationToken: 'token123' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Network timeout',
    });
  });

  it('throws fallback 500 with default message for non-Error exceptions', async () => {
    fetchMock.mockRejectedValueOnce('string error');

    const handler = (await import('../../../../../server/api/auth/password/resend-otp.post'))
      .default;
    await expect(handler(makeEvent({ confirmationToken: 'token123' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  });
});
