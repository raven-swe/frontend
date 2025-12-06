import { apiFetch } from '~/api';

export const notificationsService = {
  getNotifications: async ({
    cursor = null,
    limit = 20,
  }: {
    cursor?: string | null;
    limit?: number;
  } = {}) => {
    return await apiFetch('/api/notifications', {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? 20).toString(),
      },
    });
  },

  markAllSeen: async () => {
    return await apiFetch('/api/notifications/seen', { method: 'PATCH' });
  },
};
