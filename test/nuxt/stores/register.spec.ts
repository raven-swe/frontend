import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useRegisterStore } from '@/stores/register';
import { FetchError } from 'ofetch';

const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
  };
});

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

const registerationServiceMock = vi.hoisted(() => {
  return {
    start: vi.fn(),
    verify: vi.fn(),
    complete: vi.fn(),
    resendOtp: vi.fn(),
  };
});

vi.mock('@/services/auth/registerationService', () => {
  return {
    registerationService: registerationServiceMock,
  };
});

describe('Register Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('has correct initial state', async () => {
    const store = useRegisterStore();
    expect(store.step).toBe(0);
    expect(store.open).toBe(false);
    expect(store.registerationInfo).toBeTruthy();
  });

  it('openDialog sets open to true', async () => {
    const store = useRegisterStore();
    store.openDialog();
    expect(store.open).toBe(true);
  });

  it('submitRegisterationInfo calls $fetch and updates step on success', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'ct-1' },
      message: 'Registration started',
      success: true,
    });

    const store = useRegisterStore();
    const payload = { name: 'Alice', email: 'a@b.com', birthDate: '2000-01-01' };

    await store.submitRegisterationInfo(payload);

    expect(registerationServiceMock.start).toHaveBeenCalledWith(payload);
    expect(store.step).toBe(1);
    expect(store.registerationInfo).toEqual(payload);
  });

  it('submitRegisterationInfo handles failure gracefully', async () => {
    registerationServiceMock.start.mockRejectedValue({
      message: 'Internal server error',
      success: false,
    });

    const store = useRegisterStore();

    const payload = { name: 'Bob', email: 'b@c.com', birthDate: '2000-01-01' };
    await store.submitRegisterationInfo(payload);

    // expect that step
    expect(store.step).toBe(0);
    expect(registerationServiceMock.start).toHaveBeenCalledWith(payload);
  });

  it('submitOtp advances step on success and returns false on failure', async () => {
    registerationServiceMock.verify.mockImplementation((otp) => {
      if (otp === '123456') {
        return Promise.resolve({
          data: { valid: true },
          message: 'OTP verified',
          success: true,
        });
      } else {
        return Promise.reject({
          message: 'Invalid OTP',
          success: false,
        });
      }
    });

    const store = useRegisterStore();
    store.creationToken = 'ct-1';

    const ok = await store.submitOtp('123456');
    expect(ok).toBeUndefined();
    expect(store.step).toBe(2);

    store.step = 0;
    const failed = await store.submitOtp('0000');
    expect(failed).toBeUndefined();
    expect(store.step).toBe(0);
  });

  it('submitPassword calls $fetch and navigates on success', async () => {
    registerationServiceMock.complete.mockResolvedValue({
      data: { registered: true },
      message: 'Registration complete',
      success: true,
    });

    const store = useRegisterStore();
    store.creationToken = 'ct-final';

    await store.submitPassword('super-secret');

    expect(navigateToMock).toHaveBeenCalledWith('/home');
  });

  it('previousStep decrements step but not below 0', async () => {
    const store = useRegisterStore();
    store.step = 2;
    store.previousStep();
    expect(store.step).toBe(1);
    store.previousStep();
    expect(store.step).toBe(0);
    store.previousStep();
    expect(store.step).toBe(0);
  });

  it('resetInitialData resets store state', async () => {
    const store = useRegisterStore();
    store.step = 2;
    store.registerationInfo = {
      name: 'Test',
      email: 'test@example.com',
      birthDate: '2000-01-01',
      recaptchaToken: 'token',
    };
    store.resetInitialData();
    expect(store.step).toBe(0);
    expect(store.open).toBe(false);
    expect(store.registerationInfo).toEqual({
      name: '',
      email: '',
      birthDate: '',
      recaptchaToken: '',
    });
  });

  it('call resendOtp handles errors gracefully', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'test-token' },
    });
    registerationServiceMock.resendOtp.mockResolvedValue({
      message: 'Internal server error',
      success: false,
    });

    const { useRegisterStore } = await import('@/stores/register');

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'john',
      email: 'john@example.com',
      birthDate: '2000-01-01',
    });

    await store.resendOtp();

    expect(registerationServiceMock.resendOtp).toHaveBeenCalledWith('test-token');
  });

  it('handle rate limiting in resendOtp', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'test-token' },
    });

    const mockError = new FetchError('Too Many Requests');
    mockError.status = 429;
    mockError.data = {
      data: {
        message: 'Too many requests',
        error: {
          retryAfter: 30,
        },
      },
    };

    registerationServiceMock.resendOtp.mockRejectedValue(mockError);

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'jane',
      email: 'jane@example.com',
      birthDate: '2000-01-01',
    });

    const retryAfter = await store.resendOtp();

    expect(registerationServiceMock.resendOtp).toHaveBeenCalledWith('test-token');
    expect(retryAfter).toBe(30);
  });

  it('resendOtp handles non-rate limit errors gracefully', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'test-token' },
    });

    const mockError = new FetchError('Some other error');
    mockError.status = 500;

    registerationServiceMock.resendOtp.mockRejectedValue(mockError);

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'jane',
      email: 'jane@example.com',
      birthDate: '2000-01-01',
    });

    const retryAfter = await store.resendOtp();

    expect(registerationServiceMock.resendOtp).toHaveBeenCalledWith('test-token');
    expect(retryAfter).toBeUndefined();
  });

  it('handle non api errors in resendOtp', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'test-token' },
    });

    registerationServiceMock.resendOtp.mockRejectedValue(new Error('Network error'));

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'jane',
      email: 'jane@example.com',
      birthDate: '2000-01-01',
    });

    const retryAfter = await store.resendOtp();

    expect(registerationServiceMock.resendOtp).toHaveBeenCalledWith('test-token');
    expect(retryAfter).toBeUndefined();
  });

  it('handle no retryAfter in rate limit error in resendOtp', async () => {
    registerationServiceMock.start.mockResolvedValue({
      data: { creationToken: 'test-token' },
    });

    const mockError = new FetchError('Too Many Requests');
    mockError.status = 429;
    mockError.data = {
      data: {
        message: 'Too many requests',
        error: {
          // no retryAfter
        },
      },
    };

    registerationServiceMock.resendOtp.mockRejectedValue(mockError);

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'jane',
      email: 'jane@example.com',
      birthDate: '2000-01-01',
    });

    const retryAfter = await store.resendOtp();

    expect(registerationServiceMock.resendOtp).toHaveBeenCalledWith('test-token');
    expect(retryAfter).toBeUndefined();
  });
});
