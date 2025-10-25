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
  }));

  // Stub global functions to emulate Nuxt auto-imports
  vi.stubGlobal('defineEventHandler', h3.defineEventHandler);
  vi.stubGlobal('readBody', h3.readBody);
  vi.stubGlobal('getRouterParams', h3.getRouterParams);
  vi.stubGlobal('getQuery', h3.getQuery);
  vi.stubGlobal('getHeader', h3.getHeader);
  vi.stubGlobal('appendHeader', h3.appendHeader);

  return h3;
}
