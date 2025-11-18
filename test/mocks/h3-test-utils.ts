import type { H3Event, EventHandlerRequest } from 'h3';
import { vi } from 'vitest';

type Handler = (event: H3Event<EventHandlerRequest>) => Promise<unknown>;

export function useH3TestUtils() {
  const h3 = vi.hoisted(() => ({
    defineEventHandler: vi.fn((handler: Handler) => handler),
    readBody: vi.fn(async (event: H3Event) => {
      if (event._requestBody && typeof event._requestBody === 'string') {
        return JSON.parse(event._requestBody);
      }
      return event._requestBody || {};
    }),
    getRouterParams: vi.fn((event: H3Event) => event.context?.params || {}),
    getQuery: vi.fn((event: H3Event) => event.context?.query || {}),
    appendHeader: vi.fn((event: H3Event, name: string, value: string) => {
      event.headers.set(name, value);
    }),
    getHeader: vi.fn((event: H3Event, name: string) => {
      return event.headers.get(name);
    }),
    deleteCookie: vi.fn((event: H3Event, name: string, options?: Record<string, unknown>) => {
      // Simulate cookie deletion by setting a Set-Cookie header with an expired date
      const cookieString = `${name}=; Path=${options?.path || '/'}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      event.headers.set('Set-Cookie', cookieString);
    }),
    getValidatedRouterParams: vi.fn(
      (event: H3Event, validateFn: (params: Record<string, string>) => Promise<void>) => {
        const params = event.context?.params || {};
        return validateFn(params);
      },
    ),
    getRequestIP: vi.fn(
      (
        event: H3Event,
        opts: {
          xForwardedFor?: boolean;
        } = {},
      ) => {
        if (opts.xForwardedFor) {
          const _header = event.headers.get('x-forwarded-for');
          if (_header) {
            const xForwardedFor = _header.split(',')[0]?.trim();
            if (xForwardedFor) {
              return xForwardedFor;
            }
          }
        }

        return (event.req.context?.clientAddress as string) || event.req.ip || undefined;
      },
    ),
  }));

  // Stub global functions to emulate Nuxt auto-imports
  vi.stubGlobal('defineEventHandler', h3.defineEventHandler);
  vi.stubGlobal('readBody', h3.readBody);
  vi.stubGlobal('getRouterParams', h3.getRouterParams);
  vi.stubGlobal('getQuery', h3.getQuery);
  vi.stubGlobal('getHeader', h3.getHeader);
  vi.stubGlobal('appendHeader', h3.appendHeader);
  vi.stubGlobal('deleteCookie', h3.deleteCookie);
  vi.stubGlobal('getValidatedRouterParams', h3.getValidatedRouterParams);
  vi.stubGlobal('getRequestIP', h3.getRequestIP);

  return h3;
}
