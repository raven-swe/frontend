import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useLoginStore } from '@/stores/auth/login';

// 🧠 Mock router navigation
const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(() => ({ value: 'mocked navigation' })),
  };
});

mockNuxtImport('useRouter', () => {
  return () => ({
    push: navigateToMock,
  });
});

describe('Login Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const store = useLoginStore();
    expect(store.step).toBe(0);
    expect(store.open).toBe(false);
    expect(store.identifier).toBe('');
    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.errorMessage).toBeNull();
  });

  it('openDialog and closeDialog toggle open state', () => {
    const store = useLoginStore();
    store.openDialog();
    expect(store.open).toBe(true);
    store.closeDialog();
    expect(store.open).toBe(false);
  });

  it('checkIdentifierExists updates step and type correctly when user exists', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: true,
        data: { exists: true, type: 'email' },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkIdentifierExists('test@example.com');

    expect(result).toBe(true);
    expect(store.identifier).toBe('test@example.com');
    expect(store.type).toBe('email');
    expect(store.step).toBe(1);
    expect(store.errorMessage).toBeNull();
  });

  it('checkIdentifierExists sets step=0 and type=null when user not found', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: true,
        data: { exists: false, type: null },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkIdentifierExists('unknown@example.com');

    expect(result).toBe(false);
    expect(store.step).toBe(0);
    expect(store.type).toBeNull();
  });

  it('checkIdentifierExists handles server error properly', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => {
        const err = new Error('Internal Server Error');
        err.data = { error: { message: 'Unexpected error occurred' } };
        throw err;
      },
    });

    const store = useLoginStore();

    await expect(store.checkIdentifierExists('trigger500@example.com')).rejects.toThrow(
      'Unexpected error occurred',
    );
    expect(store.errorMessage).toBe('Unexpected error occurred');
  });

  it('handles unsuccessful checkIdentifierExists response', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: false,
        data: { exists: false, type: null },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkIdentifierExists('noone@example.com');

    expect(result).toBe(false);
    expect(store.errorMessage).toBeNull(); // or whatever your logic dictates
  });

  it('submitLogin stores tokens and navigates on success', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => ({
        success: true,
        data: {
          accessToken: 'access-123',
          refreshToken: 'refresh-456',
        },
      }),
    });

    const store = useLoginStore();
    const payload = { identifier: 'user@example.com', password: 'Password123' };
    await store.submitLogin(payload);

    expect(store.accessToken).toBe('access-123');
    expect(store.refreshToken).toBe('refresh-456');
    expect(navigateToMock).toHaveBeenCalledWith('/home');
  });

  it('submitLogin handles invalid credentials gracefully', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => {
        const err = new Error('Invalid credentials');
        err.data = { error: { message: 'Invalid credentials' } };
        throw err;
      },
    });

    const store = useLoginStore();
    const payload = { identifier: 'bad@example.com', password: 'wrong' };

    await expect(store.submitLogin(payload)).rejects.toThrow('Invalid credentials');
    expect(store.errorMessage).toBe('Invalid credentials');
  });

  it('previousStep should not go below zero', () => {
    const store = useLoginStore();
    store.step = 1;
    store.previousStep();
    expect(store.step).toBe(0);
    store.previousStep();
    expect(store.step).toBe(0);
  });
});
