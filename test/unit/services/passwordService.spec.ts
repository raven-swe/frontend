import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();

vi.stubGlobal('$fetch', mockFetch);

async function importService() {
  const { passwordService } = await import('../../../app/services/auth/passwordService');
  return passwordService;
}

describe('passwordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkUser', () => {
    it('calls correct endpoint with data', async () => {
      const mockResponse = { success: true, data: { confirmationToken: 'token123' } };
      mockFetch.mockResolvedValue(mockResponse);

      const service = await importService();
      const result = await service.checkUser({
        identifier: 'user@test.com',
        recaptchaToken: 'recap',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/password/forgot', {
        method: 'POST',
        body: { identifier: 'user@test.com', recaptchaToken: 'recap' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyUser', () => {
    it('calls correct endpoint with confirmation token and OTP', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValue(mockResponse);

      const service = await importService();
      const result = await service.verifyUser({
        confirmationToken: 'token123',
        otp: '123456',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/password/forgot/verify', {
        method: 'POST',
        body: { confirmationToken: 'token123', otp: '123456' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resendOtp', () => {
    it('calls correct endpoint with confirmation token', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValue(mockResponse);

      const service = await importService();
      const result = await service.resendOtp('token123');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/password/resend-otp', {
        method: 'POST',
        body: { confirmationToken: 'token123' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('calls correct endpoint and returns tokens', async () => {
      const mockResponse = {
        success: true,
        data: { accessToken: 'access123', refreshToken: 'refresh456' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const service = await importService();
      const result = await service.resetPassword({
        confirmationToken: 'token123',
        newPassword: 'NewPass123!',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/password/reset', {
        method: 'POST',
        body: { confirmationToken: 'token123', newPassword: 'NewPass123!' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
