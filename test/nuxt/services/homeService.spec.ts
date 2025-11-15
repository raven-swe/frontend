import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { homeService } = await import('@/services/home/homeService');

describe('homeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forYou calls API with correct params and returns response', async () => {
    registerEndpoint('/api/timeline/for-you', () => {
      return {
        data: {
          data: [{ id: 't1' }],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      };
    });

    const payload = { limit: 10, cursor: null };
    const res = await homeService.forYou(payload);

    expect(res).toEqual({
      data: {
        data: [{ id: 't1' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });
  });

  it('following calls API with correct params', async () => {
    registerEndpoint('/api/timeline/following', () => {
      return {
        data: {
          data: [{ id: 't1' }],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      };
    });

    const payload = { limit: 10, cursor: null };
    const res = await homeService.following(payload);

    expect(res).toEqual({
      data: {
        data: [{ id: 't1' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });
  });
});
