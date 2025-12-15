import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const settingsService = {
  updateUsername: async (username: string) => {
    return await apiFetch('/api/settings/username/update', {
      method: 'PATCH',
      query: { newUsername: username },
    });
  },
  getUsernameSuggestions: async (username: string) => {
    return await apiFetch('/api/settings/username/suggestions', {
      method: 'GET',
      query: {
        baseUsername: username,
      },
    });
  },
  updateInterests: async (interests: string[]) => {
    return await apiFetch('/api/settings/interests', {
      method: 'PUT',
      body: { interests },
    });
  },
  getInterests: async () => {
    return await apiFetch('/api/settings/interests', {
      method: 'GET',
    });
  },

  getFollowSuggestions: async ({
    cursor,
    limit,
    signal,
  }: {
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch('/api/onboarding/follow-suggestions', {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },
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
