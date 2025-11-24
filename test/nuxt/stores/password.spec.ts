import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { FetchError } from 'ofetch';

const { showToasterMock, routerMock, passwordServiceMock } = vi.hoisted(() => ({
  showToasterMock: vi.fn(),
  routerMock: {
    push: vi.fn(),
    currentRoute: { value: { query: {} } },
  },
  passwordServiceMock: {
    checkUser: vi.fn(),
    verifyUser: vi.fn(),
    resetPassword: vi.fn(),
    resendOtp: vi.fn(),
  },
}));

vi.mock('@/utils/showToaster', () => ({ showToaster: showToasterMock }));
vi.mock('@/services/auth/passwordService', () => ({ passwordService: passwordServiceMock }));
mockNuxtImport('useRouter', () => () => routerMock);

async function createStore() {
  const { usePasswordStore } = await import('@/stores/auth/password');
  return usePasswordStore();
}

describe('Password Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    sessionStorage.clear();
    routerMock.currentRoute.value.query = {};

    // Reset mock implementations
    passwordServiceMock.checkUser.mockReset();
    passwordServiceMock.verifyUser.mockReset();
    passwordServiceMock.resetPassword.mockReset();
    passwordServiceMock.resendOtp.mockReset();
  });

  it('has correct initial state', async () => {
    const store = await createStore();
    expect(store).toMatchObject({
      step: 0,
      open: true,
      identifier: '',
      loading: false,
    });
  });

  it('openDialog resets step and opens dialog', async () => {
    const store = await createStore();
    store.step = 2;
    store.open = false;
    store.openDialog();
    expect(store).toMatchObject({ step: 0, open: true });
  });

  it('openDialog gets identifier from query', async () => {
    routerMock.currentRoute.value.query = { identifier: 'test@email.com' };
    const store = await createStore();
    store.openDialog();
    expect(store.identifier).toBe('test@email.com');
  });

  describe('checkUserExists', () => {
    it('updates step and stores token on success', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token-123' } });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a@b.com', recaptchaToken: 'recap' });
      expect(passwordServiceMock.checkUser).toHaveBeenCalled();
      expect(store.step).toBe(1);
    });

    it('returns validation errors on 422', async () => {
      const validationError = new FetchError('Validation error') as FetchError<{
        statusCode: number;
        data: { error: { errors: Array<{ field: string; code: string }> } };
      }>;
      validationError.data = {
        statusCode: 422,
        data: {
          error: {
            errors: [{ field: 'identifier', code: 'REQUIRED' }],
          },
        },
      };

      passwordServiceMock.checkUser.mockRejectedValue(validationError);
      const store = await createStore();
      const errors = await store.checkUserExists({ identifier: '', recaptchaToken: 'recap' });
      expect(errors).toEqual([{ field: 'identifier', code: 'REQUIRED' }]);
    });

    it('returns formatted error for 404', async () => {
      const notFoundError = new FetchError('Not found') as FetchError<{
        statusCode: number;
        data: { error: { code: string } };
      }>;
      notFoundError.data = {
        statusCode: 404,
        data: {
          error: { code: 'USER_NOT_FOUND' },
        },
      };

      passwordServiceMock.checkUser.mockRejectedValue(notFoundError);
      const store = await createStore();
      const errors = await store.checkUserExists({ identifier: 'fail', recaptchaToken: 'recap' });
      expect(errors).toEqual([{ field: 'identifier', code: 'USER_NOT_FOUND' }]);
    });

    it('shows toaster for rate limit errors (429)', async () => {
      const rateLimitError = new FetchError('Rate limit') as FetchError<{
        statusCode: number;
        data: { error: { code: string } };
      }>;
      rateLimitError.data = {
        statusCode: 429,
        data: {
          error: { code: 'RATE_LIMIT_EXCEEDED' },
        },
      };

      passwordServiceMock.checkUser.mockRejectedValue(rateLimitError);
      const store = await createStore();
      await store.checkUserExists({ identifier: 'test@example.com', recaptchaToken: 'recap' });
      expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.checkUser.rateLimit');
    });

    it('shows toaster for generic errors', async () => {
      passwordServiceMock.checkUser.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'fail', recaptchaToken: 'recap' });
      expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.checkUser.error');
    });
  });

  describe('verifyUser', () => {
    it('moves to next step on success', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.verifyUser.mockResolvedValue({ success: true });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await store.verifyUser('123');
      expect(store.step).toBe(2);
    });

    it('returns validation errors on failure', async () => {
      const validationError = new FetchError('Validation error') as FetchError<{
        statusCode: number;
        data: { error: { errors: Array<{ field: string; code: string }> } };
      }>;
      validationError.data = {
        statusCode: 422,
        data: {
          error: {
            errors: [{ field: 'otp', code: 'INVALID_OTP' }],
          },
        },
      };
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.verifyUser.mockRejectedValue(validationError);
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      const errors = await store.verifyUser('wrong');
      expect(errors).toEqual([{ field: 'otp', code: 'INVALID_OTP' }]);
      expect(store.loading).toBe(false);
    });

    it('shows toaster for generic errors', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.verifyUser.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await store.verifyUser('wrong');
      expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.verifyUser.error');
    });
  });

  describe('resendOtp', () => {
    it('resends OTP and shows success message', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resendOtp.mockResolvedValue({ success: true });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await store.resendOtp();
      expect(passwordServiceMock.resendOtp).toHaveBeenCalledWith('token');
      expect(showToasterMock).toHaveBeenCalledWith('success', 'toaster.resendOtp.success');
      expect(store.step).toBe(1);
    });

    it('handles rate limit errors', async () => {
      const rateLimitError = new FetchError('Rate limit') as FetchError<{
        data: { error: { retryAfter: number }; message: string };
      }>;
      rateLimitError.status = 429;
      rateLimitError.data = {
        data: {
          error: { retryAfter: 60 },
          message: 'Rate limit exceeded',
        },
      };
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resendOtp.mockRejectedValue(rateLimitError);
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      const retryAfter = await store.resendOtp();
      expect(retryAfter).toBe(60);
      expect(showToasterMock).toHaveBeenCalled();
    });

    it('shows toaster for generic errors', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resendOtp.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await store.resendOtp();
      expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.resendOtp.error');
    });
  });

  describe('resetPassword', () => {
    it('resets data, navigates home and shows success on success', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockResolvedValue({
        data: { accessToken: 'a', refreshToken: 'r' },
      });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      await store.resetPassword('Pass123!');
      expect(showToasterMock).toHaveBeenCalledWith('success', 'toaster.resetPassword.success');
      expect(routerMock.push).toHaveBeenCalledWith('/home');
      expect(store.step).toBe(0);
      expect(store.open).toBe(false);
    });

    it('returns validation errors on failure', async () => {
      const validationError = new FetchError('Validation error') as FetchError<{
        statusCode: number;
        data: { error: { errors: Array<{ field: string; code: string }> } };
      }>;
      validationError.data = {
        statusCode: 422,
        data: {
          error: {
            errors: [{ field: 'newPassword', code: 'PASSWORD_TOO_SHORT' }],
          },
        },
      };
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockRejectedValue(validationError);
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      const errors = await store.resetPassword('fail');
      expect(errors).toEqual([{ field: 'newPassword', code: 'PASSWORD_TOO_SHORT' }]);
      expect(store.loading).toBe(false);
    });

    it('shows toaster for generic errors', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      await store.resetPassword('fail');
      expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.resetPassword.error');
      expect(store.loading).toBe(false);
    });
  });
});
