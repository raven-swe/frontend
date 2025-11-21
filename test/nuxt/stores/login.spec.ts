import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useLoginStore } from '@/stores/auth/login';
import { useRegisterStore } from '@/stores/register';

const { navigateToMock, showToasterMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(() => ({ value: 'mocked navigation' })),
    showToasterMock: vi.fn(),
  };
});

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

vi.mock('@/utils/showToaster', () => ({
  showToaster: showToasterMock,
}));

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

  it('checkUserExists handles validation errors (422)', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => {
        throw createError({
          statusCode: 422,
          data: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              errors: [{ field: 'identifier', code: 'INVALID_FORMAT' }],
            },
          },
        });
      },
    });

    const store = useLoginStore();
    const result = await store.checkUserExists('invalid');

    expect(result).toEqual([{ field: 'identifier', code: 'INVALID_FORMAT' }]);
    expect(store.step).toBe(0);
  });

  it('checkUserExists handles internal server error (500)', async () => {
    registerEndpoint('/api/auth/check-identifier', {
      method: 'GET',
      handler: () => {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        });
      },
    });

    const store = useLoginStore();
    await store.checkUserExists('test@example.com');

    expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.checkUser.error');
    expect(store.loading).toBe(false);
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

  it('login stores tokens and navigates on success', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => ({
        success: true,
        data: {
          accessToken: 'access-123',
        },
      }),
    });

    const store = useLoginStore();
    const payload = { identifier: 'user@example.com', password: 'Password@123' };
    await store.login(payload);

    expect(navigateToMock).toHaveBeenCalledWith('/home');
    expect(store.open).toBe(false);
    expect(showToasterMock).toHaveBeenCalledWith('success', 'toaster.login.success');
  });

  it('login handles validation errors (422)', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => {
        throw createError({
          statusCode: 422,
          data: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              errors: [{ field: 'password', code: 'TOO_SHORT' }],
            },
          },
        });
      },
    });

    const store = useLoginStore();
    const payload = { identifier: 'user@example.com', password: '123' };
    const result = await store.login(payload);

    expect(result).toEqual([{ field: 'password', code: 'TOO_SHORT' }]);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('login handles invalid credentials (401)', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => {
        throw createError({
          statusCode: 401,
          data: {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid credentials',
            },
          },
        });
      },
    });

    const store = useLoginStore();
    const payload = { identifier: 'bad@example.com', password: 'wrong' };
    const result = await store.login(payload);

    expect(result).toEqual([{ field: 'password', code: 'INVALID_CREDENTIALS' }]);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('login handles internal server error (500)', async () => {
    registerEndpoint('/api/auth/login', {
      method: 'POST',
      handler: () => {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        });
      },
    });

    const store = useLoginStore();
    const payload = { identifier: 'user@example.com', password: 'Password@123' };
    await store.login(payload);

    expect(showToasterMock).toHaveBeenCalledWith('error', 'toaster.login.error');
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(store.loading).toBe(false);
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

  it('openSignupDialog closes login dialog and opens register dialog', () => {
    const store = useLoginStore();
    const registerStore = useRegisterStore();

    store.open = true;
    store.step = 1;
    store.identifier = 'test@example.com';

    vi.spyOn(registerStore, 'openDialog');

    store.openSignupDialog();

    expect(store.open).toBe(false);
    expect(store.step).toBe(0);
    expect(store.identifier).toBe('');
    expect(registerStore.openDialog).toHaveBeenCalled();
  });
});
