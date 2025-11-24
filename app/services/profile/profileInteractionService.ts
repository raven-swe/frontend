import { apiFetch } from '~/api';

export const profileInteractionService = {
  followUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/following`, { method: 'POST' });
  },

  unfollowUser: async (username: string) => {
    return await apiFetch(`/api/users/${username}/following`, { method: 'DELETE' });
  },

  blockUser: async (username: string) => {
    return await apiFetch(`/api/me/blocks/${username}`, { method: 'POST' });
  },

  unblockUser: async (username: string) => {
    return await apiFetch(`/api/me/blocks/${username}`, { method: 'DELETE' });
  },

  muteUser: async (username: string) => {
    return await apiFetch(`/api/me/mutes/${username}`, { method: 'POST' });
  },

  unmuteUser: async (username: string) => {
    return await apiFetch(`/api/me/mutes/${username}`, { method: 'DELETE' });
  },
};
