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

describe('POST /api/auth/password/forgot', () => {
  it('returns confirmation token on success', async () => {
    const mockResponse = {
      success: true,
      message: 'OTP sent successfully.',
      data: { confirmationToken: 'token123' },
    };
    fetchMock.mockResolvedValueOnce(mockResponse);

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    const res = await handler(
      makeEvent({ identifier: 'test@example.com', recaptchaToken: 'recap123' }),
    );

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/auth/password/forgot', {
      method: 'POST',
      body: { identifier: 'test@example.com', recaptchaToken: 'recap123' },
    });
    expect(res).toEqual(mockResponse);
  });

  it('throws validation error (422) when identifier is missing', async () => {
    const { FetchError } = await import('ofetch');
    const validationError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        errors: [{ field: 'identifier', message: 'Identifier is required' }],
      },
    };
    const error = new FetchError('Validation failed') as unknown as {
      data: unknown;
      status: number;
    };
    error.data = validationError;
    error.status = 422;
    fetchMock.mockRejectedValueOnce(error);

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ recaptchaToken: 'recap123' }))).rejects.toMatchObject({
      statusCode: 422,
      statusMessage: 'Validation error',
      data: validationError.error,
    });
  });

  it('throws error (400) when user not found', async () => {
    const { FetchError } = await import('ofetch');
    const notFoundError = {
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    };
    const error = new FetchError('Not found') as unknown as {
      data: unknown;
      status: number;
    };
    error.data = notFoundError;
    error.status = 400;
    fetchMock.mockRejectedValueOnce(error);

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ identifier: 'notfound@example.com' }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'User not found',
      data: notFoundError.error,
    });
  });

  it('throws 500 error when backend fails', async () => {
    const { FetchError } = await import('ofetch');
    const serverError = {
      error: { code: 'INTERNAL_ERROR', message: 'Server error' },
    };
    const error = new FetchError('Server failed') as unknown as {
      data: unknown;
      status: number;
    };
    error.data = serverError;
    error.status = 500;
    fetchMock.mockRejectedValueOnce(error);

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ identifier: 'test@example.com' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Server error',
      data: serverError.error,
    });
  });

  it('uses default status 500 when FetchError has no status', async () => {
    const { FetchError } = await import('ofetch');
    fetchMock.mockRejectedValueOnce(new FetchError('fail'));

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ identifier: 'test@example.com' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  });

  it('throws fallback 500 for non-FetchError exceptions', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network timeout'));

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ identifier: 'test@example.com' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Network timeout',
    });
  });

  it('throws fallback 500 with default message for non-Error exceptions', async () => {
    fetchMock.mockRejectedValueOnce('string error');

    const handler = (await import('../../../../../../server/api/auth/password/forgot/index.post'))
      .default;
    await expect(handler(makeEvent({ identifier: 'test@example.com' }))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  });
});
