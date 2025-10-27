export default defineNuxtPlugin(() => {
  if (!window.grecaptcha) {
    window.onRecaptchaLoad = () => {
      window.dispatchEvent(new Event('recaptcha-script-loaded'));
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => console.error('Failed to load reCAPTCHA script');
    document.head.appendChild(script);
  }

  const renderRecaptcha = ({
    elementId,
    callback,
    expiredCallback,
  }: {
    elementId: string;
    callback: (token: string) => void;
    expiredCallback?: () => void;
  }) => {
    const siteKey = useRuntimeConfig().public.siteKey || '';
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const render = () => {
      window.grecaptcha.render(elementId, {
        sitekey: siteKey,
        callback,
        'expired-callback': expiredCallback,
        theme,
        hl: document.documentElement.lang || 'en',
      });
    };

    if (window.grecaptcha) {
      render();
    } else {
      window.addEventListener('recaptcha-script-loaded', render, { once: true });
    }
  };

  return {
    provide: {
      recaptcha: {
        render: renderRecaptcha,
      },
    },
  };
});
