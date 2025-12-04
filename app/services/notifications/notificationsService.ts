// eslint-disable @typescript-eslint/no-unused-vars

import mockNotifications from '../../pages/notifications/mock-notifications.json';

export const notificationsService = {
  /**
   * Returns mock notifications data (reads from mock-notifications.json).
   */
  getNotificationsMock: async ({
    _cursor,
    _limit,
    _signal,
  }: {
    _cursor?: string | null;
    _limit?: number;
    _signal?: AbortSignal;
  } = {}) => {
    // Later this function can be swapped for an SSE implementation.
    return Promise.resolve(mockNotifications.data);
  },
};
