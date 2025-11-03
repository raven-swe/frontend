import type { EventHandler, EventHandlerRequest } from 'h3';
import { createError, isError, defineEventHandler } from 'h3';

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      return response as D;
    } catch (err) {
      if (isError(err)) {
        throw err;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: (err as Error)?.message ?? 'An unexpected error occurred' },
      });
    }
  });
