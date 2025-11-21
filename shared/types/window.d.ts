export {};

declare global {
  interface Window {
    onRecaptchaLoad?: () => void;
    grecaptcha?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          theme?: 'dark' | 'light';
          size?: 'compact' | 'normal';
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          hl?: string;
        },
      ) => void;
      reset: (widgetId: string | undefined) => void;
    };
  }
}
