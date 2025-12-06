import mockNotifications from '../../pages/notifications/mock-notifications.json';

export const notificationsService = {
  /**
   * Returns mock notifications data with pagination support.
   */
  getNotificationsMock: async ({
    cursor = null,
    limit = 20,
  }: {
    cursor?: string | null;
    limit?: number;
  } = {}) => {
    // test the spinner
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotifications = mockNotifications.data;

    // Find start index based on cursor
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = allNotifications.findIndex((notif) => notif.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }

    // Slice the data for pagination
    const endIndex = startIndex + limit;
    const paginatedData = allNotifications.slice(startIndex, endIndex);

    // Determine if there's a next page
    const hasNextPage = endIndex < allNotifications.length;
    const nextCursor = hasNextPage ? paginatedData[paginatedData.length - 1]?.id : null;

    return {
      data: paginatedData,
      pagination: {
        hasNextPage,
        nextCursor,
      },
    };
  },
};
