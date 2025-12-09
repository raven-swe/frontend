import { http, HttpResponse } from 'msw';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import mockNotifications from '../../app/pages/notifications/mock-notifications.json';
import type { Notification } from '~~/shared/types/notifications';

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/notifications`, async ({ request }) => {
    try {
      await new Promise((r) => setTimeout(r, 300));

      const url = new URL(request.url);
      const cursor = url.searchParams.get('cursor');
      const limitParam = url.searchParams.get('limit');
      // const limitParam = 5;
      const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 20;

      const allNotifications: Notification[] = mockNotifications.data || [];

      // determine start index based on cursor
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = allNotifications.findIndex((n) => String(n.id) === String(cursor));
        startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      }

      const endIndex = startIndex + limit;
      const paginatedData = allNotifications.slice(startIndex, endIndex);

      const hasNextPage = endIndex < allNotifications.length;
      const nextCursor = hasNextPage ? (paginatedData[paginatedData.length - 1]?.id ?? null) : null;

      const response = {
        success: true,
        data: paginatedData,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      };

      return HttpResponse.json(response, { status: 200 });
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch notifications',
          },
        },
        { status: 500 },
      );
    }
  }),

  // Mark all notifications as seen
  http.patch(`${API_URL}/notifications/seen`, async () => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      const allNotifications: Notification[] = mockNotifications.data || [];

      // Mark every notification as seen
      allNotifications.forEach((n) => {
        n.isSeen = true;
      });

      const response: ApiSuccessResponse<Notification[]> = {
        success: true,
        message: 'All notifications marked as seen',
        data: allNotifications,
      };

      return HttpResponse.json(response, { status: 200 });
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to mark notifications as seen',
          },
        },
        { status: 500 },
      );
    }
  }),
];
