export interface CheckUserSchema {
  identifier: string;
  recaptchaToken: string;
}

export interface VerifyUserSchema {
  confirmationToken: string;
  otp: string;
}

export interface ResetPasswordSchema {
  confirmationToken: string;
  newPassword: string;
}

export const passwordService = {
  async checkUser(data: CheckUserSchema) {
    return await $fetch('/api/auth/password/forgot', {
      method: 'POST',
      body: data,
    });
  },

  async verifyUser(data: VerifyUserSchema) {
    return await $fetch('/api/auth/password/forgot/verify', {
      method: 'POST',
      body: data,
    });
  },

  async resendOtp(confirmationToken: string) {
    return await $fetch('/api/auth/password/resend-otp', {
      method: 'POST',
      body: { confirmationToken },
    });
  },

  async resetPassword(data: ResetPasswordSchema) {
    return await $fetch('/api/auth/password/reset', {
      method: 'POST',
      body: data,
    });
  },
};
