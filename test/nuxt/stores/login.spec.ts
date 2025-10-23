import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useLoginStore } from '@/stores/auth/login';

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
  });

  it('openDialog and closeDialog toggle open state', () => {
    const store = useLoginStore();
    store.openDialog();
    expect(store.open).toBe(true);
    store.closeDialog();
    expect(store.open).toBe(false);
  });

  it('checkUserExists updates step and type correctly when user exists', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: true,
        data: { exists: true, type: 'email' },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkUserExists('test@example.com');

    expect(result).toBe(true);
    expect(store.identifier).toBe('test@example.com');
    expect(store.type).toBe('email');
    expect(store.step).toBe(1);
  });

  it('checkUserExists sets step=0 and type="" when user not found', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: true,
        data: { exists: false, type: '' },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkUserExists('unknown@example.com');

    expect(result).toBe(false);
    expect(store.step).toBe(0);
    expect(store.type).toBe('');
  });

  it('checkUserExists handles server error with data.message', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => {
        const err = new Error('Internal Server Error');
        err.data = { message: 'Unexpected error occurred' };
        throw err;
      },
    });

    const store = useLoginStore();

    await expect(store.checkUserExists('trigger500@example.com')).rejects.toThrow(
      'Unexpected error occurred',
    );
  });

  it('checkUserExists handles error without data.message', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => {
        const err = new Error('Internal Server Error');
        throw err;
      },
    });

    const store = useLoginStore();

    await expect(store.checkUserExists('trigger500@example.com')).rejects.toThrow(
      'Unexpected error occurred',
    );
  });

  it('handles unsuccessful checkUserExists response', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => ({
        success: false,
        data: { exists: false, type: '' },
      }),
    });

    const store = useLoginStore();
    const result = await store.checkUserExists('noone@example.com');

    expect(result).toBe(false);
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
  });

  it('openForgotPasswordDialog navigates without identifier when step is 0', () => {
    const store = useLoginStore();
    store.step = 0;
    store.identifier = 'test@example.com';

    store.openForgotPasswordDialog();

    expect(navigateToMock).toHaveBeenCalledWith('/password-reset');
    expect(store.open).toBe(false);
  });

  it('openForgotPasswordDialog navigates with identifier when step is 1', () => {
    const store = useLoginStore();
    store.step = 1;
    store.identifier = 'test@example.com';

    store.openForgotPasswordDialog();

    expect(navigateToMock).toHaveBeenCalledWith('/password-reset?identifier=test@example.com');
    expect(store.open).toBe(false);
  });
});
