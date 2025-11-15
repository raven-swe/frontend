// test/mocks/h3-event.ts
import type { H3Event } from 'h3';
import { merge } from 'lodash';

/** Creates a mock H3Event for testing purposes.
 * @param partialEvent Partial properties to override in the mock event.
 * @param headers Optional headers to include in the event.
 * @returns A fully constructed H3Event object.
 */
export const createMockH3Event = (
  partialEvent: Partial<H3Event> & {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
  headers?: Record<string, string>,
): H3Event => {
  // Properly initialize headers as a Map
  const headerEntries = Object.entries({
    'content-type': 'application/json',
    ...(headers || {}),
  });
  const headerMap = new Map<string, string>(headerEntries);
  const event = {
    headers: headerMap,
    node: {
      req: {
        headers: Object.fromEntries(headerMap),
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
