import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock);

describe('loginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkUser', () => {
    it('calls API with correct parameters and returns user existence', async () => {
      const mockResponse = { data: { exists: true, type: 'email' } };
      fetchMock.mockResolvedValue(mockResponse);

      const { loginService } = await import('../../../app/services/auth/loginService');
      const result = await loginService.checkUser('test@example.com');

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/check-identifier', {
        method: 'GET',
        query: { identifier: 'test@example.com' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles non-existent user', async () => {
      const mockResponse = { data: { exists: false, type: '' } };
      fetchMock.mockResolvedValue(mockResponse);

      const { loginService } = await import('../../../app/services/auth/loginService');
      const result = await loginService.checkUser('nonexistent@example.com');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('calls API with credentials and returns tokens', async () => {
      const mockResponse = {
        data: { accessToken: 'access-123' },
      };
      const credentials = { identifier: 'user@test.com', password: 'Pass123!' };
      fetchMock.mockResolvedValue(mockResponse);

      const { loginService } = await import('../../../app/services/auth/loginService');
      const result = await loginService.login(credentials);

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles login with username', async () => {
      const mockResponse = {
        data: { accessToken: 'access-abc' },
      };
      const credentials = { identifier: 'username', password: 'SecurePass1!' };
      fetchMock.mockResolvedValue(mockResponse);

      const { loginService } = await import('../../../app/services/auth/loginService');
      const result = await loginService.login(credentials);

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
