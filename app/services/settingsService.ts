import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const settingsService = {
  getBlockedPaginated: async ({
    cursor,
    limit,
    signal,
  }: {
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch('/api/settings/blocks', {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },
  getMutedPaginated: async ({
    cursor,
    limit,
    signal,
  }: {
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch('/api/settings/mutes', {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },
};
