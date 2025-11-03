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
Cypress.Commands.add('getOTP', (identifier: string, type: 'registration' | 'password-reset') => {
  return cy
    .request(`${Cypress.env('API_URL')}/test/otp?identifier=${identifier}&type=${type}`)
    .its('body.data.otp');
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
