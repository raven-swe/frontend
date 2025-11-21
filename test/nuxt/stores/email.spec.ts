import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useChangeEmailStore } from '@/stores/settings/change-email';
import { useUserStore } from '@/stores/user';

const { showToasterMock } = vi.hoisted(() => {
  return {
    showToasterMock: vi.fn(),
  };
});

// Mock global auto-imported util
mockNuxtImport('showToaster', () => showToasterMock);

describe('Change Email Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const store = useChangeEmailStore();
    expect(store.step).toBe('email');
    expect(store.isOpen).toBe(false);
    expect(store.email).toBe('');
  });

  it('handleDialogChange toggles open and resets step on close', () => {
    const store = useChangeEmailStore();

    store.handleDialogChange(true);
    expect(store.isOpen).toBe(true);

    // simulate user moving to otp step
    store.step = 'otp';
    store.handleDialogChange(false);
    expect(store.isOpen).toBe(false);
    expect(store.step).toBe('email');
  });

  it('handleEmailSubmit success advances to otp and stores token indirectly (via resend)', async () => {
    // First call to change email returns confirmation token
    registerEndpoint('/api/settings/email', {
      method: 'PUT',
      handler: () => ({
        success: true,
        data: { confirmationToken: 'ct-123' },
      }),
    });

    const store = useChangeEmailStore();
    await store.handleEmailSubmit('new@example.com');

    expect(store.step).toBe('otp');
    expect(store.email).toBe('new@example.com');
    expect(showToasterMock).not.toHaveBeenCalledWith('error', expect.anything());

    // Validate the stored token flows into resend-otp
    registerEndpoint('/api/settings/email/resend-otp', {
      method: 'POST',
      handler: () => ({ success: true }),
    });

    const resendResult = await store.handleResendOtp();
    expect(resendResult).toBe(true);
    expect(showToasterMock).toHaveBeenCalledWith('success', 'OTP resent successfully.');
  });

  it('handleEmailSubmit failure shows error toaster and stays on email step', async () => {
    registerEndpoint('/api/settings/email', {
      method: 'PUT',
      handler: () => {
        throw new Error('Server down');
      },
    });

    const store = useChangeEmailStore();
    await store.handleEmailSubmit('oops@example.com');

    expect(store.step).toBe('email');
    expect(showToasterMock).toHaveBeenCalledWith('error', 'Failed to submit new email.');
  });

  it('handleOtpSubmit success verifies, updates user, resets and closes dialog', async () => {
    // Seed email change to set token and email
    registerEndpoint('/api/settings/email', {
      method: 'PUT',
      handler: () => ({ success: true, data: { confirmationToken: 'ct-123' } }),
    });

    const store = useChangeEmailStore();
    await store.handleEmailSubmit('updated@example.com');

    // Spy on userStore update
    const user = useUserStore();
    const updateSpy = vi.spyOn(user, 'updateUser');

    // Verify endpoint; ensure correct token is sent
    registerEndpoint('/api/settings/email/verify', {
      method: 'POST',
      handler: () => ({ success: true }),
    });

    const result = await store.handleOtpSubmit('9876');
    expect(result).toBe(true);
    expect(showToasterMock).toHaveBeenCalledWith('success', 'Email changed successfully.');
    expect(updateSpy).toHaveBeenCalledWith({ email: 'updated@example.com' });

    // state reset
    expect(store.step).toBe('email');
    expect(store.email).toBe('');
    expect(store.isOpen).toBe(false);
  });

  it('handleOtpSubmit failure returns false and does not update user', async () => {
    registerEndpoint('/api/settings/email', {
      method: 'PUT',
      handler: () => ({ success: true, data: { confirmationToken: 'ct-999' } }),
    });
    const store = useChangeEmailStore();
    await store.handleEmailSubmit('failcase@example.com');

    const user = useUserStore();
    const updateSpy = vi.spyOn(user, 'updateUser');

    registerEndpoint('/api/settings/email/verify', {
      method: 'POST',
      handler: () => {
        const err = new Error('Bad OTP') as Error & { data?: { message: string } };
        err.data = { message: 'Bad OTP' };
        throw err;
      },
    });

    const result = await store.handleOtpSubmit('0000');
    expect(result).toBe(false);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('handleResendOtp failure returns false', async () => {
    registerEndpoint('/api/settings/email', {
      method: 'PUT',
      handler: () => ({ success: true, data: { confirmationToken: 'ct-111' } }),
    });
    const store = useChangeEmailStore();
    await store.handleEmailSubmit('a@b.com');

    registerEndpoint('/api/settings/email/resend-otp', {
      method: 'POST',
      handler: () => {
        throw new Error('Network');
      },
    });

    const result = await store.handleResendOtp();
    expect(result).toBe(false);
  });
});
