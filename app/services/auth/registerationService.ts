import { apiFetch } from '~/api';

export interface RegisterationInfo {
  name: string;
  email: string;
  birthDate: string;
  recaptchaToken: string;
}

export const registerationService = {
  async start(data: RegisterationInfo) {
    return await apiFetch('/api/auth/register/start', {
      method: 'POST',
      body: data,
    });
  },

  async verify(otp: string, creationToken: string | null) {
    return await apiFetch('/api/auth/register/verify', {
      method: 'POST',
      body: { otp, creationToken },
    });
  },

  async resendOtp(creationToken: string | null) {
    return await apiFetch('/api/auth/register/resend-otp', {
      method: 'POST',
      body: { creationToken },
    });
  },

  async complete(password: string, creationToken: string | null) {
    return await apiFetch('/api/auth/register/complete', {
      method: 'POST',
      body: { password, creationToken },
    });
  },

  async checkEmail(email: string) {
    const res = await apiFetch(`/api/auth/check-email`, {
      method: 'GET',
      query: { email },
    });
    return res.data.exists;
  },
};
