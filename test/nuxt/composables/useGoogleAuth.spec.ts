import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useGoogleAuth } from '../../../app/composables/useGoogleAuth';

// Mock router
const mockRouterPush = vi.fn().mockResolvedValue(undefined);
mockNuxtImport('useRouter', () => {
  return () => ({
    push: mockRouterPush,
  });
});

// Mock runtime config
mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      googleClientId: '870874259747-ipkr0uktka13almqjca0husfkvi318bm.apps.googleusercontent.com',
    },
  });
});

describe('useGoogleAuth', () => {
  type MockCodeClient = {
    requestCode: ReturnType<typeof vi.fn>;
  };
  let mockCodeClient: MockCodeClient;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);

    // Setup mock code client
    mockCodeClient = {
      requestCode: vi.fn(),
    };

    // Extend the Window interface for the google property
    interface GoogleAuthWindow extends Window {
      google?: {
        accounts: {
          id: {
            initialize: ReturnType<typeof vi.fn>;
            renderButton: ReturnType<typeof vi.fn>;
            prompt: ReturnType<typeof vi.fn>;
          };
          oauth2: {
            initCodeClient: ReturnType<typeof vi.fn>;
          };
        };
      };
    }
    // Setup Google SDK mock
    (window as GoogleAuthWindow).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
          prompt: vi.fn(),
        },
        oauth2: {
          initCodeClient: vi.fn().mockReturnValue(mockCodeClient),
        },
      },
    };

    // Setup DOM
    document.body.innerHTML = '<button id="test-button"></button>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    (window as { google?: unknown }).google = undefined;
  });

  describe('initializeGoogleButton', () => {
    it('should initialize Google OAuth2 code client with correct configuration', () => {
      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      expect(window.google?.accounts.oauth2?.initCodeClient).toHaveBeenCalledWith({
        client_id: '870874259747-ipkr0uktka13almqjca0husfkvi318bm.apps.googleusercontent.com',
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: expect.any(Function),
      });
    });

    it('should attach onclick handler to button element', () => {
      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      const button = document.getElementById('test-button');
      expect(button?.onclick).not.toBeNull();
      expect(typeof button?.onclick).toBe('function');
    });

    it('should trigger requestCode when button is clicked', () => {
      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      const button = document.getElementById('test-button') as HTMLButtonElement;
      button.click();

      expect(mockCodeClient.requestCode).toHaveBeenCalledTimes(1);
    });

    it('should log error and return early when Google SDK is not loaded', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      delete (global as typeof window & { google?: unknown }).window.google;

      const { initializeGoogleButton } = useGoogleAuth();
      initializeGoogleButton('test-button');

      expect(consoleSpy).toHaveBeenCalledWith('Google OAuth2 not loaded');
      expect(window.google?.accounts.oauth2?.initCodeClient).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should handle missing button element without throwing error', () => {
      const { initializeGoogleButton } = useGoogleAuth();

      expect(() => {
        initializeGoogleButton('non-existent-button');
      }).not.toThrow();

      // initCodeClient should still be called
      expect(window.google?.accounts.oauth2?.initCodeClient).toHaveBeenCalled();
    });

    it('should log error when google.accounts is undefined', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (global as typeof globalThis).window.google = {
        accounts: { id: { initialize: vi.fn(), renderButton: vi.fn(), prompt: vi.fn() } },
      };

      const { initializeGoogleButton } = useGoogleAuth();
      initializeGoogleButton('test-button');

      expect(consoleSpy).toHaveBeenCalledWith('Google OAuth2 not loaded');
      consoleSpy.mockRestore();
    });

    it('should log error when google.accounts.oauth2 is undefined', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (global as { window: typeof globalThis.window }).window.google = {
        accounts: {
          id: { initialize: vi.fn(), renderButton: vi.fn(), prompt: vi.fn() },
        },
      };

      const { initializeGoogleButton } = useGoogleAuth();
      initializeGoogleButton('test-button');

      expect(consoleSpy).toHaveBeenCalledWith('Google OAuth2 not loaded');
      consoleSpy.mockRestore();
    });
  });

  describe('handleCodeResponse (callback)', () => {
    it('should navigate to Google callback route with authorization code', async () => {
      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      // Extract the callback function passed to initCodeClient
      const initCall = vi.mocked(window.google!.accounts.oauth2!.initCodeClient).mock.calls[0];
      const callbackFn = initCall![0].callback;

      // Simulate Google OAuth2 response
      await callbackFn({ code: 'test-auth-code-123' });

      expect(mockRouterPush).toHaveBeenCalledWith('/auth/callback/google?code=test-auth-code-123');
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in authorization code', async () => {
      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      const initCall = vi.mocked(window.google!.accounts.oauth2!.initCodeClient).mock.calls[0];
      const callbackFn = initCall![0].callback;

      const codeWithSpecialChars = '4/0AY0e-g7xXxXx_YyYy-ZzZz';
      await callbackFn({ code: codeWithSpecialChars });

      expect(mockRouterPush).toHaveBeenCalledWith(
        `/auth/callback/google?code=${codeWithSpecialChars}`,
      );
    });

    it('should log error and rethrow when navigation fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const navigationError = new Error('Navigation failed');
      mockRouterPush.mockRejectedValueOnce(navigationError);

      const { initializeGoogleButton } = useGoogleAuth();

      initializeGoogleButton('test-button');

      const initCall = vi.mocked(window.google!.accounts.oauth2!.initCodeClient).mock.calls[0];
      const callbackFn = initCall![0].callback;

      await expect(callbackFn({ code: 'test-code' })).rejects.toThrow('Navigation failed');

      expect(consoleSpy).toHaveBeenCalledWith('Authentication failed:', navigationError);
      expect(mockRouterPush).toHaveBeenCalledWith('/auth/callback/google?code=test-code');

      consoleSpy.mockRestore();
    });
  });

  describe('full authentication flow', () => {
    it('should complete entire OAuth flow from button click to navigation', async () => {
      const { initializeGoogleButton } = useGoogleAuth();

      // Step 1: Initialize the button
      initializeGoogleButton('test-button');

      // Step 2: Verify initialization
      expect(window.google?.accounts.oauth2?.initCodeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: '870874259747-ipkr0uktka13almqjca0husfkvi318bm.apps.googleusercontent.com',
          scope: 'openid email profile',
          ux_mode: 'popup',
        }),
      );

      // Step 3: User clicks the button
      const button = document.getElementById('test-button') as HTMLButtonElement;
      button.click();

      expect(mockCodeClient.requestCode).toHaveBeenCalledTimes(1);

      // Step 4: Google returns authorization code via callback
      const initCall = vi.mocked(window.google!.accounts.oauth2!.initCodeClient!).mock.calls[0];

      const callbackFn = initCall![0].callback;
      await callbackFn({ code: 'real-auth-code-from-google' });

      // Step 5: Verify navigation to callback route
      expect(mockRouterPush).toHaveBeenCalledWith(
        '/auth/callback/google?code=real-auth-code-from-google',
      );
    });

    it('should allow multiple button initializations', () => {
      const { initializeGoogleButton } = useGoogleAuth();

      document.body.innerHTML = `
        <button id="button-1"></button>
        <button id="button-2"></button>
      `;

      initializeGoogleButton('button-1');
      initializeGoogleButton('button-2');

      const btn1 = document.getElementById('button-1') as HTMLButtonElement;
      const btn2 = document.getElementById('button-2') as HTMLButtonElement;

      btn1.click();
      expect(mockCodeClient.requestCode).toHaveBeenCalledTimes(1);

      btn2.click();
      expect(mockCodeClient.requestCode).toHaveBeenCalledTimes(2);
    });
  });
});
