import { apiFetch } from '~/api';

export const meService = {
  fetchProfile: async () => {
    return await apiFetch<ApiSuccessResponse<User>>('/api/me');
  },
};
