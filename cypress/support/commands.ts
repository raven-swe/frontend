/// <reference types="cypress" />

import type { CaptchaParams, ExtendedAUTWindow } from '../types/ExtendedAUTWindow';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Mock reCAPTCHA for testing
Cypress.Commands.add('mockRecaptcha', () => {
  cy.window().then((win: ExtendedAUTWindow) => {
    win.grecaptcha = {
      render: (container: string | HTMLElement, params: CaptchaParams) => {
        // Simulate successful reCAPTCHA validation
        if (params.callback) {
          // Call the callback immediately with a mock token
          setTimeout(() => params.callback('mock-recaptcha-token'), 100);
        }
        return 'mock-widget-id';
      },
      reset: () => {},
      getResponse: () => 'mock-recaptcha-token',
    };

    // Dispatch the event that the reCAPTCHA script has loaded
    win.dispatchEvent(new Event('recaptcha-script-loaded'));
  });
});

// Get OTP from test endpoint
Cypress.Commands.add(
  'getOTP',
  (identifier: string, type: 'registration' | 'forgotPassword' | 'changeEmail') => {
    return cy
      .request(`${Cypress.env('API_URL')}/test/otp?identifier=${identifier}&type=${type}`)
      .its('body.data.otp');
  },
);

// Create a test user and retrieve its info
Cypress.Commands.add('createTestUser', () => {
  return cy.request('POST', `${Cypress.env('API_URL')}/test/users`).its('body.data');
});

// Visit a page and wait for Nuxt hydration to complete
Cypress.Commands.add('visitAndWaitForHydration', (url: string) => {
  cy.visit(url);
  cy.mockRecaptcha(); // Mock reCAPTCHA before tests
  cy.window({ timeout: 10000 }).should((win: ExtendedAUTWindow) =>
    expect(win.useNuxtApp().isHydrating).to.eq(false),
  );
});

// Login command with session caching
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password], // unique identifier for this session
    () => {
      // This function only runs if session doesn't exist
      cy.visitAndWaitForHydration('/');

      cy.get('button[data-cy="signin-start-button"]').should('be.visible').click();
      cy.get('[data-cy="signin-email-form"]').should('be.visible');

      // Enter email
      cy.get('input[data-cy="signin-identifier-input"]').type(email);
      cy.get('button[data-cy="signin-next-button"]').click();

      // Enter password
      cy.get('[data-cy="signin-password-input"] input').type(password);
      cy.get('button[data-cy="signin-next-button"]').should('not.be.disabled').click();

      // Wait for redirect to home
      cy.url({ timeout: 10000 }).should('include', '/home');
    },
    {
      validate() {
        // Validates session is still valid - check for auth cookie
        cy.getCookie('access_token').should('exist');
      },
    },
  );
});

// Mute or unmute a user
Cypress.Commands.add('muteUser', (userName: string, mute: boolean = true) => {
  const action = mute ? 'POST' : 'DELETE';
  cy.getCookie('access_token').then((cookie) => {
    cy.request({
      method: action,
      url: `${Cypress.env('API_URL')}/me/mutes/${userName}`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
    }).as('muteUserRequest');

    cy.get('@muteUserRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

// Block or unblock a user
Cypress.Commands.add('blockUser', (userName: string, block: boolean = true) => {
  const action = block ? 'POST' : 'DELETE';
  cy.getCookie('access_token').then((cookie) => {
    cy.request({
      method: action,
      url: `${Cypress.env('API_URL')}/me/blocks/${userName}`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
    }).as('blockUserRequest');
    cy.get('@blockUserRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

export {};
