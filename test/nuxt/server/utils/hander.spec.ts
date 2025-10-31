import { describe, it, expect, vi } from 'vitest';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import { createMockH3Event } from '~~/test/mocks/h3-event';

describe('defineWrappedResponseHandler', () => {
  it('returns wrapped response on success', async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const wrapped = defineWrappedResponseHandler(handler);

    const result = await wrapped(createMockH3Event({}));

    expect(handler).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('rethrows if handler throws an H3 error', async () => {
    const err = createError({ statusCode: 404, statusMessage: 'Not Found' });
    const handler = vi.fn().mockRejectedValue(err);
    const wrapped = defineWrappedResponseHandler(handler);

    await expect(wrapped(createMockH3Event({}))).rejects.toBe(err);
  });

  it('wraps plain error in 500 createError', async () => {
    const err = new Error('Boom!');
    const handler = vi.fn().mockRejectedValue(err);
    const wrapped = defineWrappedResponseHandler(handler);

    await expect(wrapped(createMockH3Event({}))).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: 'Boom!',
    });
  });

  it('wraps non-Error values correctly', async () => {
    const handler = vi.fn().mockRejectedValue('weird');
    const wrapped = defineWrappedResponseHandler(handler);

    await expect(wrapped(createMockH3Event({}))).rejects.toMatchObject({
      statusCode: 500,
      data: { message: 'An unexpected error occurred' },
    });
  });
});
