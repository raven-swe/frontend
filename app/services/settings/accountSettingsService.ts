import { apiFetch } from '~/api';

export const accountSettingsService = {
  updateUsername: async (username: string) => {
    return await apiFetch('/api/settings/username/update', {
      method: 'POST',
      query: { newUsername: username },
    });
  },
  getUsernameSuggestions: async () => {
    return await apiFetch('/api/onboarding/username-suggestions', {
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
};
