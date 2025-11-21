export const useOAuthHandlers = () => {
  const config = useRuntimeConfig();

  const githubClientId = config.public.githubClientId;
  const githubRedirectUri = config.public.githubRedirectUri;
  const githubScope = config.public.githubScope;
  const baseUrl = config.public.baseUrl;

  const googleClientId = config.public.googleClientId;
  const googleRedirectUri = config.public.googleRedirectUri;
  const googleScope = config.public.googleScope;

  const handleGithubSignIn = () => {
    const params = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: githubRedirectUri,
      scope: githubScope,
      state: btoa(
        JSON.stringify({
          redirect: `${baseUrl}/auth/callback/github`,
        }),
      ),
    });
    window?.open(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
      'github-oauth',
      `width=500,height=600,top=${(screen.height - 600) / 2},left=${(screen.width - 500) / 2}`,
    );
  };

  const handleGoogleSignIn = () => {
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleRedirectUri,
      response_type: 'code',
      scope: googleScope,
    });
    window?.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      'google-oauth',
      `width=500,height=600,top=${(screen.height - 600) / 2},left=${(screen.width - 500) / 2}`,
    );
  };

  const setupOAuthMessageListener = () => {
    if (import.meta.client) {
      window?.addEventListener('message', (event) => {
        if (event.origin !== window?.location.origin) return;
        if (event.data.type === 'github-auth') {
          navigateTo('/auth/callback/github?code=' + event.data.code);
        }
        if (event.data.type === 'google-auth') {
          navigateTo('/auth/callback/google?code=' + event.data.code);
        }
      });
    }
  };

  return {
    handleGithubSignIn,
    handleGoogleSignIn,
    setupOAuthMessageListener,
  };
};
