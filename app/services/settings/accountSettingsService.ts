import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

export const accountSettingsService = {
  updateUsername: async (username: string) => {
    return await apiFetch('/api/settings/username/update', {
      method: 'PATCH',
      query: { newUsername: username },
    });
  },
  getUsernameSuggestions: async () => {
    return await apiFetch('/api/settings/username/suggestions', {
      method: 'GET',
    });
  },
  updateInterests: async (interests: string[]) => {
    return await apiFetch('/api/onboarding/interests', {
      method: 'POST',
      body: { interests },
    });
  },
  getInterests: async () => {
    return await apiFetch('/api/onboarding/interests', {
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
};
