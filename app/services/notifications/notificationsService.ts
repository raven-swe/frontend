import { apiFetch } from '~/api';

export const notificationsService = {
  getNotifications: async ({
    cursor = null,
    limit = 20,
    filter = undefined,
  }: {
    cursor?: string | null;
    limit?: number;
    filter?: string;
  } = {}) => {
    return await apiFetch('/api/notifications', {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? 20).toString(),
        filter,
      },
    });
  },

  markAllSeen: async () => {
    return await apiFetch('/api/notifications/seen', { method: 'PATCH' });
  },
};
