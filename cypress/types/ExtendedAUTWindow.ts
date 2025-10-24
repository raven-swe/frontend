export type ExtendedAUTWindow = Cypress.AUTWindow & {
  // To add Nuxt-specific types to Cypress AUTWindow
  useNuxtApp: () => {
    isHydrating: boolean;
  };
};
