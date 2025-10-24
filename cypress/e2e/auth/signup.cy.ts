// cypress/e2e/auth/signup.cy.ts

import type { ExtendedAUTWindow } from '../../types/ExtendedAUTWindow';

// TODO: remove all intercepts and use real backend once available
// TODO: test resend OTP functionality
// TODO: test CAPTCHA integration once available
// TODO: test internal server errors and network failures handling

describe('Signup Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().should((win: ExtendedAUTWindow) =>
      expect(win.useNuxtApp().isHydrating).to.eq(false),
    ); // Wait for hydration
    cy.get('button[data-cy="signup-start-button"]').should('be.visible').click();
    cy.get('[data-cy="signup-info-form"]').should('be.visible');
  });

  describe('Form Validation', () => {
    it('should have next button disabled initially', () => {
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });

    it('should show error for invalid email format', () => {
      cy.get('input[data-cy="signup-name"]').type('Amr Samy');
      cy.get('input[data-cy="signup-email"]').type('invalid-email');

      // Should show email validation error
      cy.get('input[data-cy="signup-email"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('should show error for underage user (less than 13 years old)', () => {
      const today = new Date();
      const recentYear = today.getFullYear() - 5; // 5 years old

      cy.get('input[data-cy="signup-name"]').type('Little Infant');
      cy.get('input[data-cy="signup-email"]').type('young@example.com');
      cy.get('select[data-cy="signup-dob-month"]').select('January');
      cy.get('select[data-cy="signup-dob-day"]').select('15');
      cy.get('select[data-cy="signup-dob-year"]').select(recentYear.toString());

      // Should show age restriction error
      cy.get('[data-cy="signup-dob-error"]').should('be.visible');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });

    it('should handle different monthdays', () => {
      // Test January 31st
      // TODO: Test selecting the day before the month (waiting on fix for the issue)
      cy.get('select[data-cy="signup-dob-month"]').select('January');
      cy.get('select[data-cy="signup-dob-day"]').select('31');
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', '31');

      // Test April 31th (which is invalid)
      cy.get('select[data-cy="signup-dob-day"]').select('31');
      cy.get('select[data-cy="signup-dob-month"]').select('April');
      // Should deselect the invalid day (null value)
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', null);
    });

    it('should handle leap year for February 29th', () => {
      // Select February 29th on a leap year
      cy.get('select[data-cy="signup-dob-year"]').select('2016'); // Leap year
      cy.get('select[data-cy="signup-dob-month"]').select('February');
      cy.get('select[data-cy="signup-dob-day"]').select('29');
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', '29');
      // Check that non-leap years aren't selectable (not in the years dropdown)
      cy.get('select[data-cy="signup-dob-year"] option').each(($el) => {
        const year = parseInt($el.text());
        const leapYearCheck =
          year % 4 === 0 || (year % 100 === 0 && year % 400 === 0) || year % 4 !== 0;
        expect(leapYearCheck).to.equal(true);
      });

      // Now select Febrauary 28th
      cy.get('select[data-cy="signup-dob-day"]').select('28');
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', '28');
      // Check that non-leap years are selectable
      cy.get('select[data-cy="signup-dob-year"]').select('2019'); // Non-leap year
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', '28');
    });
  });

  describe('Email Availability', () => {
    it('should show error when email already exists', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            exists: true,
          },
        },
      }).as('checkEmailRequest');

      cy.fixture('signup/existingUser.json').then((user) => {
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);
      });
      cy.wait('@checkEmailRequest');

      // Should show email exists error
      cy.get('input[data-cy="signup-email"]').should('have.attr', 'aria-invalid', 'true');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });

    it('should allow signup with new email', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            exists: false,
          },
        },
      }).as('checkEmailRequest');

      cy.fixture('signup/newUser.json').then((user) => {
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);

        cy.wait('@checkEmailRequest').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.data.exists).to.equal(false);
        });

        cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
        cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
        cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);

        cy.get('button[data-cy="signup-next-button"]').should('not.be.disabled');
      });
    });
  });

  describe('Complete Signup Flow', () => {
    it('should successfully complete signup with valid data', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            exists: false,
          },
        },
      }).as('checkEmailRequest');

      cy.intercept('POST', '/api/auth/register/start', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            creationToken: 'test-token-123',
          },
        },
      }).as('startRegistration');

      cy.intercept('POST', '/api/auth/register/verify', {
        statusCode: 200,
        body: {
          success: true,
        },
      }).as('verifyOtp');

      cy.intercept('POST', '/api/auth/register/complete', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            accessToken: 'final-access-token-456',
            refreshToken: 'final-refresh-token-789',
          },
        },
      }).as('completeRegistration');

      cy.fixture('signup/newUser.json').then((user) => {
        // Step 1: Fill registration info
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);
        cy.wait('@checkEmailRequest');

        cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
        cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
        cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@startRegistration');

        // Step 2: Enter OTP
        // TODO: Handle OTP retrieval dynamically
        cy.get('[data-cy="signup-otp-form"]').should('be.visible');
        cy.get('input[data-cy="signup-otp"]').type('123456');
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@verifyOtp');

        // Step 3: Set Password
        cy.get('[data-cy="signup-password-form"]').should('be.visible');
        cy.get('input[data-cy="signup-password"]').type(user.password);
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@completeRegistration');

        // Verify successful signup
        cy.url().should('include', '/home');
      });
    });

    it('should handle invalid OTP', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            exists: false,
          },
        },
      }).as('checkEmailRequest');

      cy.intercept('POST', '/api/auth/register/start', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            creationToken: 'test-token-123',
          },
        },
      }).as('startRegistration');

      cy.intercept('POST', '/api/auth/register/verify', {
        statusCode: 400,
        body: {
          success: false,
          error: 'Invalid OTP',
        },
      }).as('verifyOtp');

      cy.fixture('signup/newUser.json').then((user) => {
        // Fill registration info
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);
        cy.wait('@checkEmailRequest');

        cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
        cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
        cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@startRegistration');

        // Enter invalid OTP
        cy.get('[data-cy="signup-otp-form"]').should('be.visible');
        cy.get('input[data-cy="signup-otp"]').type('000000');
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@verifyOtp');

        // Should show error and stay on OTP page
        cy.get('[data-cy="signup-otp-form"]').should('be.visible');
        cy.get('[data-test-id="otp-error"]').should('be.visible');
        cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
      });
    });
  });

  describe('Navigation', () => {
    it('should allow going back from OTP step', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: {
          data: {
            exists: false,
          },
        },
      }).as('checkEmailRequest');

      cy.intercept('POST', '/api/auth/register/start', {
        statusCode: 200,
        body: {
          data: {
            creationToken: 'test-token-123',
          },
        },
      }).as('startRegistration');

      cy.fixture('signup/newUser.json').then((user) => {
        // Fill and submit registration info
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);
        cy.wait('@checkEmailRequest');

        cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
        cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
        cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
        cy.get('button[data-cy="signup-next-button"]').click();

        cy.wait('@startRegistration');

        // Should be on OTP step
        cy.get('[data-cy="signup-otp-form"]').should('be.visible');

        // Go back
        cy.get('[data-test-id="back-button"]').click();

        // Should be back on info form
        cy.get('[data-cy="signup-info-form"]').should('be.visible');
        // Data should be preserved
        cy.get('input[data-cy="signup-email"]').should('have.value', user.email);
        cy.get('input[data-cy="signup-name"]').should('have.value', user.name);
        // DOB selections should be preserved
        cy.get('select[data-cy="signup-dob-month"]').should('have.value', user.dob.month);
        cy.get('select[data-cy="signup-dob-day"]').should('have.value', user.dob.day);
        cy.get('select[data-cy="signup-dob-year"]').should('have.value', user.dob.year);
      });
    });
  });
});
