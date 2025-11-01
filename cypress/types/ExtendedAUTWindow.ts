export type CaptchaParams = {
  callback?: (token: string) => void;
};

export type ExtendedAUTWindow = Cypress.AUTWindow & {
  // To add Nuxt-specific types to Cypress AUTWindow
  useNuxtApp: () => {
    isHydrating: boolean;
  };
  grecaptcha: {
    render: (container: string | HTMLElement, params: CaptchaParams) => string;
    reset: () => void;
    getResponse: () => string;
  };
};
