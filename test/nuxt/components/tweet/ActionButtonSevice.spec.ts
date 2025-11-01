import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub global $fetch used by service functions
const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock);

describe('actionButtonsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('likeTweet calls correct endpoint and returns response', async () => {
    const mockRes = { success: true, message: 'liked' };
    fetchMock.mockResolvedValue(mockRes);

    const { likeTweet } = await import('@/services/tweet/actionButtonsService');
    const res = await likeTweet('tw-123');

    expect(fetchMock).toHaveBeenCalledWith('/api/tweets/tw-123/like', { method: 'POST' });
    expect(res).toEqual(mockRes);
  });

  it('unLikeTweet calls correct endpoint and returns response', async () => {
    const mockRes = { success: true, message: 'unliked' };
    fetchMock.mockResolvedValue(mockRes);

    const { unLikeTweet } = await import('@/services/tweet/actionButtonsService');
    const res = await unLikeTweet('tw-123');

    expect(fetchMock).toHaveBeenCalledWith('/api/tweets/tw-123/like', { method: 'DELETE' });
    expect(res).toEqual(mockRes);
  });

  it('retweetTweet calls correct endpoint and returns response', async () => {
    const mockRes = { success: true, message: 'retweeted' };
    fetchMock.mockResolvedValue(mockRes);

    const { retweetTweet } = await import('@/services/tweet/actionButtonsService');
    const res = await retweetTweet('tw-123');

    expect(fetchMock).toHaveBeenCalledWith('/api/tweets/tw-123/retweet', { method: 'POST' });
    expect(res).toEqual(mockRes);
  });

  it('undoRetweetTweet calls correct endpoint and returns response', async () => {
    const mockRes = { success: true, message: 'undo-retweet' };
    fetchMock.mockResolvedValue(mockRes);

    const { undoRetweetTweet } = await import('@/services/tweet/actionButtonsService');
    const res = await undoRetweetTweet('tw-123');

    expect(fetchMock).toHaveBeenCalledWith('/api/tweets/tw-123/retweet', { method: 'DELETE' });
    expect(res).toEqual(mockRes);
  });

  it('likeTweet rethrows on error and logs', async () => {
    const err = new Error('network');
    fetchMock.mockRejectedValue(err);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { likeTweet } = await import('@/services/tweet/actionButtonsService');
    await expect(likeTweet('tw-err')).rejects.toBe(err);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('undoRetweetTweet rethrows on error and logs', async () => {
    const err = new Error('server');
    fetchMock.mockRejectedValue(err);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { undoRetweetTweet } = await import('@/services/tweet/actionButtonsService');
    await expect(undoRetweetTweet('tw-err')).rejects.toBe(err);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('unLikeTweet rethrows on error and logs', async () => {
    const err = new Error('bad-request');
    fetchMock.mockRejectedValue(err);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unLikeTweet } = await import('@/services/tweet/actionButtonsService');
    await expect(unLikeTweet('tw-err')).rejects.toBe(err);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('retweetTweet rethrows on error and logs', async () => {
    const err = new Error('timeout');
    fetchMock.mockRejectedValue(err);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { retweetTweet } = await import('@/services/tweet/actionButtonsService');
    await expect(retweetTweet('tw-err')).rejects.toBe(err);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
