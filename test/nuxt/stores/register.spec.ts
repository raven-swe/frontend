import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useRegisterStore } from '@/stores/register';

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
  });

  it('has correct initial state', () => {
    const store = useRegisterStore();
    expect(store.step).toBe(0);
    expect(store.open).toBe(false);
    expect(store.registerationInfo).toBeTruthy();
  });

  it('openDialog sets open to true', () => {
    const store = useRegisterStore();
    store.openDialog();
    expect(store.open).toBe(true);
  });

  it('submitRegisterationInfo calls $fetch and updates step on success', async () => {
    registerEndpoint('/api/auth/register/start', {
      method: 'POST',
      handler: () => {
        return {
          success: true,
          message: 'Registration started',
          data: { creationToken: 'ct-123' },
        };
      },
    });

    const store = useRegisterStore();
    const payload = { name: 'Alice', email: 'a@b.com', birthDate: '2000-01-01' };

    await store.submitRegisterationInfo(payload);

    expect(store.step).toBe(1);
    expect(store.registerationInfo).toEqual(payload);
  });

  it('submitRegisterationInfo handles failure gracefully', async () => {
    // register a failing endpoint
    registerEndpoint('/api/auth/register/start', {
      method: 'POST',
      handler: () => {
        return {
          success: false,
          message: 'Registration failed',
        };
      },
    });

    const store = useRegisterStore();
    const payload = { name: 'Bob', email: 'b@c.com', birthDate: '2000-01-01' };
    await store.submitRegisterationInfo(payload);

    // expect that step
    expect(store.step).toBe(0);
  });

  it('submitOtp advances step on success and returns false on failure', async () => {
    registerEndpoint('/api/auth/register/verify', {
      method: 'POST',
      handler: () => {
        return {
          success: true,
          message: 'Verified',
        };
      },
    });

    const store = useRegisterStore();
    store.creationToken = 'ct-1';

    const ok = await store.submitOtp('123456');
    expect(ok).toBe(true);
    expect(store.step).toBe(2);

    registerEndpoint('/api/auth/register/verify', {
      method: 'POST',
      handler: () => {
        return {
          success: false,
          message: 'Verification failed',
        };
      },
    });
    store.step = 0;
    const failed = await store.submitOtp('0000');
    expect(failed).toBe(false);
    expect(store.step).toBe(0);
  });

  it('submitPassword calls $fetch and navigates on success', async () => {
    registerEndpoint('/api/auth/register/complete', {
      method: 'POST',
      handler: () => {
        return {
          success: true,
          message: 'Registration complete',
        };
      },
    });

    const store = useRegisterStore();
    store.creationToken = 'ct-final';

    await store.submitPassword('super-secret');

    expect(navigateToMock).toHaveBeenCalledWith('/home');
  });

  it('previousStep decrements step but not below 0', () => {
    const store = useRegisterStore();
    store.step = 2;
    store.previousStep();
    expect(store.step).toBe(1);
    store.previousStep();
    expect(store.step).toBe(0);
    store.previousStep();
    expect(store.step).toBe(0);
  });
});
