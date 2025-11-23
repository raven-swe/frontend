// cypress/e2e/auth/login.cy.ts

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visitAndWaitForHydration('/');
    cy.get('button[data-cy="signin-start-button"]').should('be.visible').click();
    cy.get('[data-cy="signin-email-form"]').should('be.visible');
  });

  describe('Form Validation', () => {
    it('should have next button disabled initially', () => {
      cy.get('button[data-cy="signin-next-button"]').should('be.disabled');
    });
    it('should not allow invalid email/username', () => {
      cy.get('input[data-cy="signin-identifier-input"]').type('invalid-email');
      cy.get('button[data-cy="signin-next-button"]').should('not.be.disabled');
      cy.get('button[data-cy="signin-next-button"]').click();

      cy.contains('User not found');

      cy.get('[data-cy="signin-password-form"]').should('not.exist');
      cy.get('[data-cy="signin-email-form"]').should('be.visible');
      cy.get('input[data-cy="signin-identifier-input"]').should('be.empty');
      cy.get('button[data-cy="signin-next-button"]').should('be.disabled');
    });

    it('should allow valid email/username and proceed to password step', () => {
      cy.fixture('auth/existingUser.json').then((user) => {
        cy.get('input[data-cy="signin-identifier-input"]').type(user.email);
        cy.get('button[data-cy="signin-next-button"]').should('not.be.disabled');
        cy.get('button[data-cy="signin-next-button"]').click();

        cy.get('[data-cy="signin-password-form"]').should('be.visible');
        cy.get('[data-cy="signin-email-form"]').should('not.exist');
      });
    });

    it('should not allow invalid password', () => {
      cy.fixture('auth/existingUser.json').then((user) => {
        // Proceed to password step
        cy.get('input[data-cy="signin-identifier-input"]').type(user.email);
        cy.get('button[data-cy="signin-next-button"]').click();

        // Enter invalid password
        cy.get('[data-cy="signin-password-input"] input').type('wrongpassword');
        cy.get('button[data-cy="signin-next-button"]').should('not.be.disabled');
        cy.get('button[data-cy="signin-next-button"]').click();

        cy.contains('The password you entered is incorrect');

        cy.get('[data-cy="signin-password-form"]').should('be.visible');
        cy.get('[data-cy="signin-password-input"] input').should('be.empty');
      });
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to Forgot Password page', () => {
      cy.get('[data-cy="signin-forgot-password-link"]').click();
      cy.get('form[data-cy="signin-forgot-pwd-account-form"]').should('be.visible');
    });

    it('should navigate to Forgot Password page after entering identifier', () => {
      cy.fixture('auth/existingUser.json').then((user) => {
        cy.get('input[data-cy="signin-identifier-input"]').type(user.email);
        cy.get('button[data-cy="signin-next-button"]').click();

        cy.get('[data-cy="signin-password-form"]').should('be.visible');

        cy.get('[data-cy="signin-forgot-password-link"]').click();
        cy.get('form[data-cy="signin-forgot-pwd-account-form"]').should('be.visible');
      });
    });

    it('should navigate to Sign Up page', () => {
      cy.get('[data-cy="signin-signup-link"]').click();
      cy.get('form[data-cy="signup-info-form"]').should('be.visible');
    });
  });

  describe('Complete Login Flow', () => {
    it('should login successfully with valid credentials', () => {
      cy.fixture('auth/existingUser.json').then((user) => {
        // Proceed to password step
        cy.get('input[data-cy="signin-identifier-input"]').type(user.email);
        cy.get('button[data-cy="signin-next-button"]').click();

        // Enter valid password
        cy.get('[data-cy="signin-password-input"] input').type(user.password);
        cy.get('button[data-cy="signin-next-button"]').should('not.be.disabled');
        cy.get('button[data-cy="signin-next-button"]').click();

        // Verify url redirection to home page
        cy.url({ timeout: 10000 }).should('eq', `${Cypress.config().baseUrl}/home/for-you`);
      });
    });
  });

  describe('Test Logout', () => {
    it('should logout successfully', () => {
      cy.fixture('auth/existingUser.json').then((user) => {
        cy.login(user.email, user.password);
        cy.visitAndWaitForHydration('/home/for-you');
        // Verify url redirection to home page
        cy.url({ timeout: 10000 }).should('eq', `${Cypress.config().baseUrl}/home/for-you`);
        // Click logout button
        cy.get('button[data-cy="logout-button"]').click();
        // Verify redirection to login page
        cy.url({ timeout: 10000 }).should('eq', `${Cypress.config().baseUrl}/`);
      });
    });
  });
});
