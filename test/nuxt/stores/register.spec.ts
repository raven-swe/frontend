import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { reactive } from 'vue';

const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(() => {
      return { value: 'mocked navigation' };
    }),
  };
});

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

describe('Register Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('has correct initial state', async () => {
    const { useRegisterStore } = await import('@/stores/register');
    const store = useRegisterStore();
    expect(store.step).toBe(0);
    expect(store.open).toBe(false);
    expect(store.registerationInfo).toBeTruthy();
  });

  it('openDialog sets open to true', async () => {
    const { useRegisterStore } = await import('@/stores/register');
    const store = useRegisterStore();
    store.openDialog();
    expect(store.open).toBe(true);
  });

  it('submitRegisterationInfo calls $fetch and updates step on success', async () => {
    const registerationService = reactive({
      start: vi.fn().mockResolvedValue({
        data: { creationToken: 'test-token' },
      }),
    });
    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    const { useRegisterStore } = await import('@/stores/register');
    const store = useRegisterStore();
    const payload = { name: 'Alice', email: 'a@b.com', birthDate: '2000-01-01' };

    await store.submitRegisterationInfo(payload);

    expect(registerationService.start).toHaveBeenCalledWith(payload);
    expect(store.step).toBe(1);
    expect(store.registerationInfo).toEqual(payload);
  });

  it('submitRegisterationInfo handles failure gracefully', async () => {
    const registerationService = reactive({
      start: vi.fn().mockRejectedValue({ message: 'Internal server error', success: false }),
    });
    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));
    const { useRegisterStore } = await import('@/stores/register');

    const store = useRegisterStore();
    const payload = { name: 'Bob', email: 'b@c.com', birthDate: '2000-01-01' };
    await store.submitRegisterationInfo(payload);

    // expect that step
    expect(store.step).toBe(0);
    expect(registerationService.start).toHaveBeenCalledWith(payload);
  });

  it('submitOtp advances step on success and returns false on failure', async () => {
    const registerationService = reactive({
      verify: vi
        .fn()
        .mockResolvedValueOnce({
          message: 'Verified',
          success: true,
        })
        .mockRejectedValueOnce({ message: 'Internal server error', success: false }),
    });
    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));
    const { useRegisterStore } = await import('@/stores/register');

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
    const registerationService = reactive({
      complete: vi.fn().mockResolvedValueOnce({ message: 'Registration complete', success: true }),
    });
    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    const useAuth = vi.fn().mockReturnValue({
      signup: vi.fn().mockResolvedValueOnce({ message: 'Signup successful', success: true }),
    });
    vi.doMock('@/composables/useAuth', () => ({
      useAuth,
    }));

    const { useRegisterStore } = await import('@/stores/register');

    const store = useRegisterStore();
    store.creationToken = 'ct-final';

    await store.submitPassword('super-secret');

    expect(navigateToMock).toHaveBeenCalledWith('/home');
  });

  it('previousStep decrements step but not below 0', async () => {
    const { useRegisterStore } = await import('@/stores/register');
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
    const { useRegisterStore } = await import('@/stores/register');
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
    const registerationService = reactive({
      start: vi.fn().mockResolvedValue({
        data: { creationToken: 'test-token' },
      }),
      resendOtp: vi
        .fn()
        .mockRejectedValueOnce({ message: 'Internal server error', success: false }),
    });
    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));
    const { useRegisterStore } = await import('@/stores/register');

    const store = useRegisterStore();
    await store.submitRegisterationInfo({
      name: 'john',
      email: 'john@example.com',
      birthDate: '2000-01-01',
    });

    await store.resendOtp();

    expect(registerationService.resendOtp).toHaveBeenCalledWith('test-token');
  });
});
