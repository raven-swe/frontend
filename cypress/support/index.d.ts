/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock reCAPTCHA functionality in tests
     * @example cy.mockRecaptcha()
     */
    mockRecaptcha(): Chainable<void>;
  }
}
