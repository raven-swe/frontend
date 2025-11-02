export const accountService = {
  async checkAccountExists(_identifier: string) {
    const response = await $fetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
      '/api/auth/check-identifier',
      {
        method: 'GET',
        query: { identifier: _identifier },
      },
    );
    return response.data.exists;
  },
};
