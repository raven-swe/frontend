import { apiFetch } from '~/api';
import type { HomeTab } from '~~/shared/types/timeline';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const homeService = {
  async getHomeTab({
    tab,
    cursor,
    limit,
    signal,
  }: {
    tab: HomeTab;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) {
    return await apiFetch(`/api/timeline/${tab}`, {
      method: 'GET',
      query: {
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
        cursor: cursor ?? undefined,
      },
      signal,
    });
  },
};
