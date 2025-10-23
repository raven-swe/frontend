import type { CodeClient } from '~~/shared/types/google';

export const useGoogleAuth = () => {
  const config = useRuntimeConfig();
  const router = useRouter();
  let codeClient: CodeClient | null = null;

  const initializeGoogleButton = (elementId: string) => {
    if (!window.google || !window.google.accounts?.oauth2) {
      console.error('Google OAuth2 not loaded');
      return;
    }

    codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: config.public.googleClientId as string,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: handleCodeResponse,
    });

    const btn = document.getElementById(elementId);
    if (btn) {
      btn.onclick = () => codeClient?.requestCode();
    }
  };

  const handleCodeResponse = async (response: { code: string }) => {
    try {
      await router.push(`/auth/callback/google?code=${response.code}`);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  return {
    initializeGoogleButton,
  };
};
