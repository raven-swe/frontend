// test/mocks/h3-event.ts
import type { H3Event } from 'h3';
import { merge } from 'lodash';

export const createMockH3Event = (
  partialEvent: Partial<H3Event> & {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
): H3Event => {
  const event = {
    headers: new Map<string, string>(),
    node: {
      req: {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    },
    context: {
      params: partialEvent.params || {},
      query: partialEvent.query || {},
    },
    // Our mock readBody function will look for this property
    _requestBody: partialEvent.body,
  } as unknown as H3Event;

  // Deeply merge the partial event to allow for overrides
  return merge(event, partialEvent) as H3Event;
};
