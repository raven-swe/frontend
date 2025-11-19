import { apiFetch } from '~/api';

export interface LoginSchema {
  identifier: string;
  password: string;
}

export const loginService = {
  async checkUser(_identifier: string) {
    const res = await $fetch('/api/auth/check-identifier', {
      method: 'GET',
      query: { identifier: _identifier },
    });
    return { exists: res.data.exists, type: res.data.type };
  },

  async login(data: LoginSchema) {
    return await $fetch('/api/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  async logout() {
    const res = await apiFetch('/api/auth/logout', {
      method: 'POST',
    });
    useUserStore().logout();
    navigateTo('/');
    return res;
  },
};
