export interface RegisterationInfo {
  name: string;
  email: string;
  birthDate: string;
  recaptchaToken: string;
}

export const registerationService = {
  async start(data: RegisterationInfo) {
    return await $fetch<ApiSuccessResponse<{ creationToken: string }>>('/api/auth/register/start', {
      method: 'POST',
      body: data,
    });
  },

  async verify(otp: string, creationToken: string | null) {
    return await $fetch<ApiResponseBase>('/api/auth/register/verify', {
      method: 'POST',
      body: { otp, creationToken },
    });
  },

  async resendOtp(creationToken: string | null) {
    return await $fetch<ApiResponseBase>('/api/auth/register/resend-otp', {
      method: 'POST',
      body: { creationToken },
    });
  },

  async complete(password: string, creationToken: string | null) {
    return await $fetch<ApiResponseBase>('/api/auth/register/complete', {
      method: 'POST',
      body: { password, creationToken },
    });
  },

  async checkEmail(email: string) {
    const res = await $fetch<{ data: { exists: boolean } }>(
      `/api/auth/check-email?email=${encodeURIComponent(email)}`,
    );
    return res.data.exists;
  },
};
