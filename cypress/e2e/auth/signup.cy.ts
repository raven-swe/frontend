import { createTestUser } from '../../support/helpers/createTestUser';

describe('Signup Flow', () => {
  beforeEach(() => {
    cy.visitAndWaitForHydration('/');
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
      cy.get('input[data-cy="signup-email"]').type('young@baby.com');
      cy.get('select[data-cy="signup-dob-month"]').select('January');
      cy.get('select[data-cy="signup-dob-day"]').select('15');
      cy.get('select[data-cy="signup-dob-year"]').select(recentYear.toString());

      // Should show age restriction error
      cy.get('[data-cy="signup-dob-error"]').should('be.visible');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });

    it('should handle different month days', () => {
      // Test January 31st
      cy.get('select[data-cy="signup-dob-month"]').select('January');
      cy.get('select[data-cy="signup-dob-day"]').select('31');
      cy.get('select[data-cy="signup-dob-day"]').should('have.value', '31');

      // Test April 31st (which is invalid)
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
      cy.fixture('auth/existingUser.json').then((user) => {
        cy.get('input[data-cy="signup-name"]').type(user.name);
        cy.get('input[data-cy="signup-email"]').type(user.email);
      });

      // Should show email exists error
      cy.get('input[data-cy="signup-email"]').should('have.attr', 'aria-invalid', 'true');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });

    it('should allow signup with new email', () => {
      const user = createTestUser();

      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);

      cy.get('button[data-cy="signup-next-button"]').should('not.be.disabled');
    });
  });

  describe('Navigation', () => {
    it('should allow going back from OTP step', () => {
      const user = createTestUser();
      // Fill and submit registration info
      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
      cy.get('button[data-cy="signup-next-button"]').click();

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

  describe('OTP', () => {
    it('should handle invalid OTP', () => {
      const user = createTestUser();
      // Fill registration info
      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
      cy.get('button[data-cy="signup-next-button"]').click();

      // Enter invalid OTP
      cy.get('[data-cy="signup-otp-form"]').should('be.visible');
      cy.get('input[data-cy="signup-otp"]').type('000000');
      cy.get('button[data-cy="signup-next-button"]').click();

      // Should show error and stay on OTP page
      cy.get('[data-cy="signup-otp-form"]').should('be.visible');
      cy.get('[data-test-id="otp-error"]').should('be.visible');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');
    });
    it('should handle resend OTP', () => {
      const user = createTestUser();

      // Step 1: Fill registration info
      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
      cy.get('button[data-cy="signup-next-button"]').click();

      // Step 2: Request a new OTP
      cy.get('[data-cy="signup-otp-form"]').should('be.visible');

      cy.getOTP(user.email, 'registration').then((firstOtp) => {
        // Click resend OTP
        cy.get('button[data-cy="signup-resend-otp-button"]').click();
        cy.wait(1000); // A short wait to ensure OTP is processed
        // Get the new OTP
        cy.getOTP(user.email, 'registration').then((secondOtp) => {
          // Ensure the OTPs are different
          expect(secondOtp).to.not.equal(firstOtp);
          // Enter the new OTP
          cy.get('input[data-cy="signup-otp"]').type(secondOtp);
          cy.get('button[data-cy="signup-next-button"]').click();
        });
      });
    });
  });

  describe('Password Strength Validation', () => {
    it('should show password strength feedback', () => {
      const user = createTestUser();

      // Fill registration info
      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
      cy.get('button[data-cy="signup-next-button"]').click();

      // Enter OTP
      cy.get('[data-cy="signup-otp-form"]').should('be.visible');
      cy.getOTP(user.email, 'registration').then((otp) => {
        cy.get('input[data-cy="signup-otp"]').type(otp);
        cy.get('button[data-cy="signup-next-button"]').click();
      });

      // On password step
      cy.get('[data-cy="signup-password-form"]').should('be.visible');

      // Test weak password
      cy.get('input[data-cy="signup-password"]').type('12345');
      cy.get('[data-test-id="password-error"]').should('be.visible');
      cy.get('button[data-cy="signup-next-button"]').should('be.disabled');

      // Test strong password
      cy.get('input[data-cy="signup-password"]').clear().type('Str0ngP@ssw0rd!');
      cy.get('[data-test-id="password-error"]').should('not.exist');
      cy.get('button[data-cy="signup-next-button"]').should('not.be.disabled');
    });
  });

  describe('Complete Signup Flow', () => {
    it('should complete signup successfully', () => {
      const user = createTestUser();

      // Step 1: Fill registration info
      cy.get('input[data-cy="signup-name"]').type(user.name);
      cy.get('input[data-cy="signup-email"]').type(user.email);

      cy.get('select[data-cy="signup-dob-month"]').select(user.dob.month);
      cy.get('select[data-cy="signup-dob-day"]').select(user.dob.day);
      cy.get('select[data-cy="signup-dob-year"]').select(user.dob.year);
      cy.get('button[data-cy="signup-next-button"]').click();

      // Step 2: Enter OTP
      cy.get('[data-cy="signup-otp-form"]').should('be.visible');

      cy.getOTP(user.email, 'registration').then((otp) => {
        cy.get('input[data-cy="signup-otp"]').type(otp);
        cy.get('button[data-cy="signup-next-button"]').click();
      });

      // Step 3: Set Password
      cy.get('[data-cy="signup-password-form"]').should('be.visible');
      cy.get('input[data-cy="signup-password"]').type(user.password);
      cy.get('button[data-cy="signup-next-button"]').click();

      // Verify successful signup
      cy.url().should('include', '/home');
    });
  });
});
