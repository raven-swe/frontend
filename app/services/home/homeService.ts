import { apiFetch } from '~/api';
import type { HomeTab } from '~~/shared/types/timeline';
import type { PaginationParams } from '~~/shared/types/pagination';

export const homeService = {
  async getHomeTab(pagination: PaginationParams, tab: HomeTab, signal?: AbortSignal) {
    return await apiFetch(`/api/timeline/${tab}`, {
      method: 'GET',
      query: {
        limit: pagination.limit,
        cursor: pagination.cursor ?? undefined,
      },
      signal,
    });
  },
};
