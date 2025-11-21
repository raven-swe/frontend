import { apiFetch } from '~/api';

export const profileInteractionService = {
  followUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/following`, { method: 'POST' });
  },

  unfollowUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/following`, { method: 'DELETE' });
  },

  blockUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/blocking`, { method: 'POST' });
  },

  unblockUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/blocking`, { method: 'DELETE' });
  },

  muteUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/muting`, { method: 'POST' });
  },

  unmuteUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/muting`, { method: 'DELETE' });
  },
};
