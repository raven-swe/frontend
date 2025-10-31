import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

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

    it('handles error gracefully', async () => {
      passwordServiceMock.checkUser.mockRejectedValue(new Error('User not found'));
      const store = await createStore();
      await expect(
        store.checkUserExists({ identifier: 'fail', recaptchaToken: 'recap' }),
      ).rejects.toThrow('Unexpected error occurred');
    });

    it('handles error with custom message', async () => {
      passwordServiceMock.checkUser.mockRejectedValue({ data: { message: 'Account locked' } });
      const store = await createStore();
      await expect(
        store.checkUserExists({ identifier: 'fail', recaptchaToken: 'recap' }),
      ).rejects.toThrow('Account locked');
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

    it('handles error gracefully', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.verifyUser.mockRejectedValue({ data: { message: 'Invalid OTP' } });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await expect(store.verifyUser('wrong')).rejects.toThrow('Invalid OTP');
      expect(store.loading).toBe(false);
    });

    it('handles error without custom message', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.verifyUser.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await expect(store.verifyUser('wrong')).rejects.toThrow('Unexpected error occurred');
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
      expect(showToasterMock).toHaveBeenCalledWith('success', 'OTP resent successfully');
      expect(store.step).toBe(1);
    });

    it('handles error gracefully', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resendOtp.mockRejectedValue({ data: { message: 'Rate limit exceeded' } });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await expect(store.resendOtp()).rejects.toThrow('Rate limit exceeded');
    });

    it('handles error without custom message', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resendOtp.mockRejectedValue(new Error('Network error'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'a', recaptchaToken: 'b' });
      await expect(store.resendOtp()).rejects.toThrow('Unexpected error occurred');
    });
  });

  describe('resetPassword', () => {
    it('stores tokens and navigates home on success', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockResolvedValue({
        data: { accessToken: 'a', refreshToken: 'r' },
      });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      await store.resetPassword('Pass123!');
      expect(showToasterMock).toHaveBeenCalledWith('success', 'Password reset successful');
      expect(routerMock.push).toHaveBeenCalledWith('/home');
    });

    it('handles error gracefully', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockRejectedValue(new Error('Invalid token'));
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      await expect(store.resetPassword('fail')).rejects.toThrow('Unexpected error occurred');
    });

    it('handles error with custom message', async () => {
      passwordServiceMock.checkUser.mockResolvedValue({ data: { confirmationToken: 'token' } });
      passwordServiceMock.resetPassword.mockRejectedValue({ data: { message: 'Token expired' } });
      const store = await createStore();
      await store.checkUserExists({ identifier: 'x', recaptchaToken: 'y' });
      await expect(store.resetPassword('fail')).rejects.toThrow('Token expired');
      expect(store.loading).toBe(false);
    });
  });
});
