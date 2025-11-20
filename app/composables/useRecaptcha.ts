import { useI18n } from 'vue-i18n';
export default function useRecaptcha() {
  const {
    public: { siteKey },
  } = useRuntimeConfig();
  const { locale } = useI18n();
  const renderRecaptcha = ({
    elementId,
    callback,
    expiredCallback,
  }: {
    elementId: string;
    callback: (token: string) => void;
    expiredCallback?: () => void;
  }) => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const render = () => {
      window?.grecaptcha?.render(elementId, {
        sitekey: siteKey,
        callback,
        'expired-callback': expiredCallback,
        theme,
        hl: locale.value ?? 'en',
      });
    };

    if (window.grecaptcha) {
      render();
    } else {
      window.addEventListener('recaptcha-script-loaded', render, { once: true });
    }
  };

  const resetRecapcha = (elementId: string | undefined) => {
    if (window.grecaptcha) {
      window.grecaptcha.reset(elementId);
    }
  };

  return {
    render: renderRecaptcha,
    reset: resetRecapcha,
  };
}
