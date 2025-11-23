// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Handle Vite HMR errors during development
Cypress.on('uncaught:exception', (err) => {
  // Ignore HMR/dynamic import errors from Vite/Nuxt
  if (err.message.includes('Failed to fetch dynamically imported module')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});
