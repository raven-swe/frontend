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

    /**
     * Custom command to create a test user and retrieve its info
     * @example cy.createTestUser()
     */
    createTestUser(): Chainable<{
      id: string;
      email: string;
      username: string;
      password: string;
      passwordHash: string;
      birthdate: string;
      createdAt: string;
    }>;
    /**
     * Custom command to visit a page and wait for Nuxt hydration
     * @param url - URL to visit
     * @example cy.visitAndWaitForHydration('/home')
     */
    visitAndWaitForHydration(url: string): Chainable<void>;

    /**
     * Custom command to log in with session caching
     * @param email - User email
     * @param password - User password
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
  }
}
