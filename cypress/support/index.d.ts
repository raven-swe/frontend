/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock reCAPTCHA functionality in tests
     * @example cy.mockRecaptcha()
     */
    mockRecaptcha(): Chainable<void>;

    /**
     * Custom command to get OTP from test endpoint
     * @param identifier - Email or phone number
     * @param type - Type of OTP (registration or password-reset)
     * @example cy.getOTP('user@example.com', 'registration')
     */
    getOTP(identifier: string, type: 'registration' | 'password-reset'): Chainable<string>;
  }
}
