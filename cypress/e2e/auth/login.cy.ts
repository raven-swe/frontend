// cypress/e2e/auth/signup.cy.ts

import type { ExtendedAUTWindow } from '../../types/ExtendedAUTWindow';
// import { createTestUser } from '../../support/helpers/createTestUser';

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // cy.window().its('grecaptcha', { timeout: 10000 }).should('have.property', 'render');
    cy.window().should((win: ExtendedAUTWindow) =>
      expect(win.useNuxtApp().isHydrating).to.eq(false),
    ); // Wait for hydration
  });
});
