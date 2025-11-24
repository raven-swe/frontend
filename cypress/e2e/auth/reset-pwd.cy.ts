import type { ExtendedAUTWindow } from '../../types/ExtendedAUTWindow';

describe('Reset Password Flow', () => {
  beforeEach(() => {
    cy.visit('/password-reset');
    cy.mockRecaptcha(); // Mock reCAPTCHA before tests
    // cy.window().its('grecaptcha', { timeout: 10000 }).should('have.property', 'render');
    cy.window({ timeout: 10000 }).should((win: ExtendedAUTWindow) =>
      expect(win.useNuxtApp().isHydrating).to.eq(false),
    ); // Wait for hydration
    cy.get('form[data-cy="signin-forgot-pwd-account-form"]').should('be.visible');
  });

  describe('Form Validation', () => {
    it('should have next button disabled initially', () => {
      cy.get('button[data-cy="forgot-pwd-next-button"]').should('be.disabled');
    });

    it('should not allow invalid email/username', () => {
      cy.get('input[data-cy="forgot-pwd-identifier-input"]').type('invalid-email');
      cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled');
      cy.get('button[data-cy="forgot-pwd-next-button"]').click();
      cy.get('form[data-cy="signin-forgot-pwd-account-form"]').should('be.visible');
      cy.get('input[data-cy="forgot-pwd-identifier-input"]').should('be.empty');
    });

    it('should allow valid email/username and proceed to next step', () => {
      cy.fixture('auth/resetPwdUser.json').then((user) => {
        cy.get('input[data-cy="forgot-pwd-identifier-input"]').type(user.email);
        cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled');
        cy.get('button[data-cy="forgot-pwd-next-button"]').click();

        cy.get('form[data-cy="forgot-pwd-otp-form"]').should('be.visible');
      });
    });
  });

  describe('OTP Verification', () => {
    beforeEach(() => {
      // Proceed to OTP step
      cy.fixture('auth/resetPwdUser.json').then((user) => {
        cy.get('input[data-cy="forgot-pwd-identifier-input"]').type(user.email);
        cy.get('button[data-cy="forgot-pwd-next-button"]').click();
        cy.get('form[data-cy="forgot-pwd-otp-form"]').should('be.visible');
      });
    });
    it('should not allow invalid OTP', () => {
      cy.get('input[data-cy="forgot-pwd-otp-input"]').type('123456');
      cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled');
      cy.get('button[data-cy="forgot-pwd-next-button"]').click();
      cy.get('form[data-cy="forgot-pwd-otp-form"]').should('be.visible');
      cy.get('input[data-cy="forgot-pwd-otp-input"]').should('be.empty');
    });

    it('should allow valid OTP and proceed to new password step', () => {
      cy.fixture('auth/resetPwdUser.json').then((user) => {
        cy.getOTP(user.email, 'forgotPassword').then((otp) => {
          cy.get('input[data-cy="forgot-pwd-otp-input"]').type(otp);
          cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled');
          cy.get('button[data-cy="forgot-pwd-next-button"]').click();
          cy.get('form[data-cy="forgot-pwd-new-password-form"]').should('be.visible');
        });
      });
    });
  });

  describe('Complete Password Reset', () => {
    it('should not allow setting new invalid password', () => {
      // Proceed to new password step
      cy.fixture('auth/resetPwdUser.json').then((user) => {
        cy.get('input[data-cy="forgot-pwd-identifier-input"]').type(user.email);
        cy.get('button[data-cy="forgot-pwd-next-button"]').click();
        cy.get('form[data-cy="forgot-pwd-otp-form"]').should('be.visible');
        cy.getOTP(user.email, 'forgotPassword').then((otp) => {
          cy.get('input[data-cy="forgot-pwd-otp-input"]').type(otp);
          cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled').click();
          cy.get('form[data-cy="forgot-pwd-new-password-form"]').should('be.visible');
          // Enter new password
          cy.get('[data-cy="forgot-pwd-new-password-input"]').type('weakpwd');
          cy.get('[data-cy="forgot-pwd-confirm-password-input"]').type('weakpwd');
          cy.get('button[data-cy="forgot-pwd-next-button"]').should('be.disabled');
        });
      });
    });
    it('should allow setting new password and complete the flow', () => {
      // Proceed to new password step
      cy.fixture('auth/resetPwdUser.json').then((user) => {
        cy.get('input[data-cy="forgot-pwd-identifier-input"]').type(user.email);
        cy.get('button[data-cy="forgot-pwd-next-button"]').click();
        cy.get('form[data-cy="forgot-pwd-otp-form"]').should('be.visible');
        cy.getOTP(user.email, 'forgotPassword').then((otp) => {
          cy.get('input[data-cy="forgot-pwd-otp-input"]').type(otp);
          cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled').click();
          cy.get('form[data-cy="forgot-pwd-new-password-form"]').should('be.visible');
          // Enter new password
          cy.get('[data-cy="forgot-pwd-new-password-input"]').type(user.newPassword);
          cy.get('[data-cy="forgot-pwd-confirm-password-input"]').type(user.newPassword);
          cy.get('button[data-cy="forgot-pwd-next-button"]').should('not.be.disabled');
          cy.get('button[data-cy="forgot-pwd-next-button"]').click();
          cy.contains('Password reset successful').should('be.visible');
        });
      });
    });
  });
});
