import { apiFetch } from '~/api';

export interface LoginSchema {
  identifier: string;
  password: string;
}

export const loginService = {
  async checkUser(_identifier: string) {
    return await $fetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
      '/api/auth/check-identifier',
      {
        method: 'GET',
        query: { identifier: _identifier },
      },
    );
  },

  async login(data: LoginSchema) {
    return await $fetch<ApiSuccessResponse<{ accessToken: string }>>('/api/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  async logout() {
    const response = await apiFetch<ApiResponseBase>('/api/auth/logout', {
      method: 'POST',
    });
    useUserStore().logout();
    navigateTo('/');
    return response;
  },
};
