import { apiFetch } from '~/api';

export const accountService = {
  async checkAccountExists(_identifier: string) {
    const response = await apiFetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
      '/api/auth/check-identifier',
      {
        method: 'GET',
        query: { identifier: _identifier },
      },
    );
    return response.data.exists ?? false;
  },
};
