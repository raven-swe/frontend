import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { homeService } = await import('@/services/home/homeService');

describe('homeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHomeTab calls API with correct params for "for-you" tab', async () => {
    registerEndpoint('/api/timeline/for-you', () => {
      return {
        data: {
          data: [{ id: 't1' }],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      };
    });

    const payload = { limit: 10, cursor: null };
    const res = await homeService.getHomeTab({ ...payload, tab: 'for-you' });

    expect(res).toEqual({
      data: {
        data: [{ id: 't1' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });
  });

  it('getHomeTab calls API with correct params for "following" tab', async () => {
    registerEndpoint('/api/timeline/following', () => {
      return {
        data: {
          data: [{ id: 't1' }],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      };
    });

    const payload = { limit: 10, cursor: null };
    const res = await homeService.getHomeTab({ ...payload, tab: 'following' });

    expect(res).toEqual({
      data: {
        data: [{ id: 't1' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });
  });
});
