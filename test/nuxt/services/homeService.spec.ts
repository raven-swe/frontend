import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock);

describe('homeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forYou calls API with correct params and returns response', async () => {
    const mockResp = {
      data: {
        data: [{ id: 't1' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    };
    fetchMock.mockResolvedValue(mockResp);

    const { homeService } = await import('../../../app/services/home/homeService');
    const res = await homeService.forYou({ limit: 10, cursor: null });

    expect(fetchMock).toHaveBeenCalledWith('/api/timeline/for-you', {
      method: 'GET',
      query: { limit: 10, cursor: null },
    });
    expect(res).toEqual(mockResp);
  });

  it('following calls API with correct params', async () => {
    const mockResp = {
      data: {
        data: [{ id: 't2' }],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    };
    fetchMock.mockResolvedValue(mockResp);

    const { homeService } = await import('../../../app/services/home/homeService');
    const res = await homeService.following({ limit: 5, cursor: '0' });

    expect(fetchMock).toHaveBeenCalledWith('/api/timeline/following', {
      method: 'GET',
      query: { limit: 5, cursor: '0' },
    });
    expect(res).toEqual(mockResp);
  });
});
