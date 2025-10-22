export const useGoogleAuth = () => {
  const config = useRuntimeConfig();

  const initializeGoogleButton = (elementId: string) => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: config.public.googleClientId as string,
      callback: handleCredentialResponse,
    });

    // Render the Google Sign-In button
    window.google.accounts.id.renderButton(document.getElementById(elementId)!, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: 300,
      shape: 'pill',
    });
  };

  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    try {
      // Send the token to  backend
      //   console.log('Google Credential Response:', response.credential);
      const result = await $fetch(`${config.public.backendUrl}/api/auth/google`, {
        method: 'POST',
        body: { token: response.credential },
      });

      // Handle successful authentication (store token, redirect)
      // navigateTo('/home');
      return result;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  return {
    initializeGoogleButton,
  };
};
