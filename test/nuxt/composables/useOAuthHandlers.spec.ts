import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOAuthHandlers } from '@/composables/useOAuthHandlers';

const mockNavigateTo = vi.fn();
vi.stubGlobal('navigateTo', mockNavigateTo);

describe('useOAuthHandlers', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let windowOpenSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let addEventListenerSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  });

  describe('handleGithubSignIn', () => {
    it('opens GitHub OAuth popup with correct base URL and window name', () => {
      const { handleGithubSignIn } = useOAuthHandlers();
      handleGithubSignIn();

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/login/oauth/authorize'),
        'github-oauth',
        expect.stringContaining('width=500,height=600'),
      );
    });

    it('includes required OAuth parameters in URL', () => {
      const { handleGithubSignIn } = useOAuthHandlers();
      handleGithubSignIn();

      const callArgs = windowOpenSpy.mock.calls[0];
      const url = callArgs[0] as string;

      // Check that URL contains required parameter keys
      expect(url).toContain('client_id=');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('scope=');
      expect(url).toContain('state=');
    });

    it('includes state parameter with callback path', () => {
      const { handleGithubSignIn } = useOAuthHandlers();
      handleGithubSignIn();

      const callArgs = windowOpenSpy.mock.calls[0];
      const url = callArgs[0] as string;
      const urlObj = new URL(url);
      const state = urlObj.searchParams.get('state');

      expect(state).toBeTruthy();
      if (state) {
        const decodedState = JSON.parse(atob(state));
        expect(decodedState.redirect).toContain('/auth/callback/github');
      }
    });
  });

  describe('handleGoogleSignIn', () => {
    it('opens Google OAuth popup with correct base URL and window name', () => {
      const { handleGoogleSignIn } = useOAuthHandlers();
      handleGoogleSignIn();

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'),
        'google-oauth',
        expect.stringContaining('width=500,height=600'),
      );
    });

    it('includes required OAuth parameters in URL', () => {
      const { handleGoogleSignIn } = useOAuthHandlers();
      handleGoogleSignIn();

      const callArgs = windowOpenSpy.mock.calls[0];
      const url = callArgs[0] as string;

      // Check that URL contains required parameter keys
      expect(url).toContain('client_id=');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=');
    });
  });

  describe('setupOAuthMessageListener', () => {
    it('sets up message listener on window', () => {
      const { setupOAuthMessageListener } = useOAuthHandlers();
      setupOAuthMessageListener();

      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('validates message event listener is a function', () => {
      const { setupOAuthMessageListener } = useOAuthHandlers();
      setupOAuthMessageListener();

      const listener = addEventListenerSpy.mock.calls[0]?.[1];
      expect(typeof listener).toBe('function');
    });

    it('returns all handler functions', () => {
      const handlers = useOAuthHandlers();

      expect(typeof handlers.handleGithubSignIn).toBe('function');
      expect(typeof handlers.handleGoogleSignIn).toBe('function');
      expect(typeof handlers.setupOAuthMessageListener).toBe('function');
    });
  });
});
