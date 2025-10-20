import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We will mock Nitro/NUXT server globals and ofetch's FetchError, then dynamically import handlers
// so the mocks are in place before module evaluation.

// Mock ofetch's FetchError class used inside handlers for instanceof checks
vi.mock('ofetch', () => {
  class MockFetchError extends Error {
    data?: unknown;
    statusCode?: number;
    constructor(message: string, data?: unknown, statusCode?: number) {
      super(message);
      this.name = 'FetchError';
      this.data = data;
      this.statusCode = statusCode;
    }
  }
  return { FetchError: MockFetchError };
});

// Utility: create a minimal H3/Nitro event with params
const makeEvent = (params: Record<string, string> = {}) => ({
  context: { params },
});

declare global {
  var defineEventHandler: <T extends (...args: unknown[]) => unknown>(handler: T) => T;
  var createError: (input: {
    message: string;
    statusCode?: number;
  }) => Error & { statusCode?: number };
  var $fetch: ReturnType<typeof vi.fn>;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Ensure a clean module graph between tests so imports re-evaluate with our stubs
  vi.resetModules();

  // Stub Nitro helpers
  // defineEventHandler should just return the handler function
  const defEH = ((fn: (...args: unknown[]) => unknown) => fn) as unknown;
  vi.stubGlobal('defineEventHandler', defEH);
  // createError should create an Error with statusCode
  vi.stubGlobal(
    'createError',
    ({ message, statusCode }: { message: string; statusCode?: number }) => {
      const err = new Error(message) as Error & { statusCode?: number };
      err.name = 'HTTPError';
      err.statusCode = statusCode;
      return err;
    },
  );

  // Stub $fetch globally
  fetchMock = vi.fn();
  vi.stubGlobal('$fetch', fetchMock as unknown);

  // Provide backend URL
  process.env.BACKEND_URL = 'https://api.example.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Server API - Tweets', () => {
  describe('GET /api/tweets', () => {
    it('returns list of tweets on success', async () => {
      const sampleTweets = [
        {
          id: '1',
          content: 'Hello world',
          createdAt: new Date().toISOString(),
          author: {
            username: 'john',
            displayName: 'John',
            avatarUrl: 'x',
            isFollowing: false,
            isFollower: false,
          },
          replyCount: 0,
          retweetCount: 0,
          likeCount: 0,
          isLiked: false,
          isRetweeted: false,
          entities: { mentions: [], hashtags: [] },
          media: [],
        },
      ];

      fetchMock.mockResolvedValueOnce(sampleTweets);
      const handler = (await import('../../../../server/api/tweets/index.get')).default;
      const result = await handler();

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tweets');
      expect(result).toEqual(sampleTweets);
    });

    it('maps FetchError to HTTP error with backend message and status code', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Fail', { message: 'Backend down' }, 503),
      );

      const handler = (await import('../../../../server/api/tweets/index.get')).default;

      await expect(handler()).rejects.toMatchObject({ message: 'Backend down', statusCode: 503 });
    });

    it("uses default 'Request failed' when FetchError has no message", async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      // No data/message provided to force default message path
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Fail', undefined, 502),
      );
      const handler = (await import('../../../../server/api/tweets/index.get')).default;
      await expect(handler()).rejects.toMatchObject({ message: 'Request failed', statusCode: 502 });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      // Provide a message but omit status to hit e.statusCode || 500
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Fail', { message: 'Backend msg' }),
      );
      const handler = (await import('../../../../server/api/tweets/index.get')).default;
      await expect(handler()).rejects.toMatchObject({ message: 'Backend msg', statusCode: 500 });
    });

    it('maps unknown errors to 500 with generic message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Boom'));
      const handler = (await import('../../../../server/api/tweets/index.get')).default;
      await expect(handler()).rejects.toMatchObject({
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });

  describe('GET /api/tweets/:id', () => {
    it('returns a tweet by id', async () => {
      const tweetId = '42';
      const sampleTweet = {
        id: tweetId,
        content: 'The answer',
        createdAt: new Date().toISOString(),
        author: {
          username: 'arthur',
          displayName: 'Arthur',
          avatarUrl: 'x',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      };

      fetchMock.mockResolvedValueOnce(sampleTweet);
      const handler = (await import('../../../../server/api/tweets/[id]/index.get')).default;
      const result = await handler(makeEvent({ id: tweetId }));

      expect(fetchMock).toHaveBeenCalledWith(`https://api.example.com/tweets/${tweetId}`);
      expect(result).toEqual(sampleTweet);
    });

    it('maps FetchError to HTTP error', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Nope', { message: 'Not found' }, 404),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/index.get')).default;
      await expect(handler(makeEvent({ id: '999' }))).rejects.toMatchObject({
        message: 'Not found',
        statusCode: 404,
      });
    });

    it("uses default 'Request failed' when FetchError has no message", async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Fail', undefined, 500),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/index.get')).default;
      await expect(handler(makeEvent({ id: '123' }))).rejects.toMatchObject({
        message: 'Request failed',
        statusCode: 500,
      });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Fail', { message: 'By id msg' }),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/index.get')).default;
      await expect(handler(makeEvent({ id: '123' }))).rejects.toMatchObject({
        message: 'By id msg',
        statusCode: 500,
      });
    });

    it('maps unknown errors to 500', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Oops'));
      const handler = (await import('../../../../server/api/tweets/[id]/index.get')).default;
      await expect(handler(makeEvent({ id: '1' }))).rejects.toMatchObject({
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });

  describe('POST /api/tweets/:id/like', () => {
    it('forwards like to backend and returns response', async () => {
      fetchMock.mockResolvedValueOnce({ success: true, message: 'Liked' });
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.post')).default;
      const res = await handler(makeEvent({ id: '7' }));

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tweets/7/like', {
        method: 'POST',
      });
      expect(res).toEqual({ success: true, message: 'Liked' });
    });

    it('maps FetchError to HTTP error with fallback message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', undefined, 400),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.post')).default;
      await expect(handler(makeEvent({ id: '7' }))).rejects.toMatchObject({
        message: 'Failed to create tweet',
        statusCode: 400,
      });
    });

    it('maps FetchError to HTTP error using backend message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Already liked' }, 409),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.post')).default;
      await expect(handler(makeEvent({ id: '7' }))).rejects.toMatchObject({
        message: 'Already liked',
        statusCode: 409,
      });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Like failed' }),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.post')).default;
      await expect(handler(makeEvent({ id: '7' }))).rejects.toMatchObject({
        message: 'Like failed',
        statusCode: 500,
      });
    });

    it('maps unknown errors to 500 with unexpected message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Down'));
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.post')).default;
      await expect(handler(makeEvent({ id: '7' }))).rejects.toMatchObject({
        message: 'Unexpected error creating tweet',
        statusCode: 500,
      });
    });
  });

  describe('DELETE /api/tweets/:id/like', () => {
    it('forwards unlike to backend and returns response', async () => {
      fetchMock.mockResolvedValueOnce({ success: true, message: 'Unliked' });
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.delete'))
        .default;
      const res = await handler(makeEvent({ id: '8' }));

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tweets/8/like', {
        method: 'DELETE',
      });
      expect(res).toEqual({ success: true, message: 'Unliked' });
    });

    it('maps FetchError to HTTP error with fallback message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', undefined, 400),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '8' }))).rejects.toMatchObject({
        message: 'Failed to create tweet',
        statusCode: 400,
      });
    });

    it('maps FetchError to HTTP error using backend message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Not liked' }, 409),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '8' }))).rejects.toMatchObject({
        message: 'Not liked',
        statusCode: 409,
      });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Unlike failed' }),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '8' }))).rejects.toMatchObject({
        message: 'Unlike failed',
        statusCode: 500,
      });
    });

    it('maps unknown errors to 500 with unexpected message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Down'));
      const handler = (await import('../../../../server/api/tweets/[id]/like/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '8' }))).rejects.toMatchObject({
        message: 'Unexpected error creating tweet',
        statusCode: 500,
      });
    });
  });

  describe('POST /api/tweets/:id/retweet', () => {
    it('forwards retweet to backend and returns response', async () => {
      fetchMock.mockResolvedValueOnce({ success: true, message: 'Retweeted' });
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.post'))
        .default;
      const res = await handler(makeEvent({ id: '9' }));

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tweets/9/retweet', {
        method: 'POST',
      });
      expect(res).toEqual({ success: true, message: 'Retweeted' });
    });

    it('maps FetchError to HTTP error with fallback message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', undefined, 400),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.post'))
        .default;
      await expect(handler(makeEvent({ id: '9' }))).rejects.toMatchObject({
        message: 'Failed to create tweet',
        statusCode: 400,
      });
    });

    it('maps FetchError to HTTP error using backend message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Already retweeted' }, 409),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.post'))
        .default;
      await expect(handler(makeEvent({ id: '9' }))).rejects.toMatchObject({
        message: 'Already retweeted',
        statusCode: 409,
      });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Retweet failed' }),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.post'))
        .default;
      await expect(handler(makeEvent({ id: '9' }))).rejects.toMatchObject({
        message: 'Retweet failed',
        statusCode: 500,
      });
    });

    it('maps unknown errors to 500 with unexpected message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Down'));
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.post'))
        .default;
      await expect(handler(makeEvent({ id: '9' }))).rejects.toMatchObject({
        message: 'Unexpected error creating tweet',
        statusCode: 500,
      });
    });
  });

  describe('DELETE /api/tweets/:id/retweet', () => {
    it('forwards unretweet to backend and returns response', async () => {
      fetchMock.mockResolvedValueOnce({ success: true, message: 'Unretweeted' });
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.delete'))
        .default;
      const res = await handler(makeEvent({ id: '10' }));

      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tweets/10/retweet', {
        method: 'DELETE',
      });
      expect(res).toEqual({ success: true, message: 'Unretweeted' });
    });

    it('maps FetchError to HTTP error with fallback message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', undefined, 400),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '10' }))).rejects.toMatchObject({
        message: 'Failed to create tweet',
        statusCode: 400,
      });
    });

    it('maps FetchError to HTTP error using backend message', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Not retweeted' }, 409),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '10' }))).rejects.toMatchObject({
        message: 'Not retweeted',
        statusCode: 409,
      });
    });

    it('defaults statusCode to 500 when missing in FetchError', async () => {
      const { FetchError } = await import('ofetch');
      type FetchErrorCtor = new (message: string, data?: unknown, statusCode?: number) => unknown;
      fetchMock.mockRejectedValueOnce(
        new (FetchError as unknown as FetchErrorCtor)('Bad', { message: 'Unretweet failed' }),
      );
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '10' }))).rejects.toMatchObject({
        message: 'Unretweet failed',
        statusCode: 500,
      });
    });

    it('maps unknown errors to 500 with unexpected message', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Down'));
      const handler = (await import('../../../../server/api/tweets/[id]/retweet/index.delete'))
        .default;
      await expect(handler(makeEvent({ id: '10' }))).rejects.toMatchObject({
        message: 'Unexpected error creating tweet',
        statusCode: 500,
      });
    });
  });
});
