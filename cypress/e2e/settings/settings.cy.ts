// cypress/e2e/auth/signup.cy.ts

describe('Settings Actions', function () {
  beforeEach(() => {
    // Create a test user and store it as an alias
    cy.createTestUser().then((user) => {
      cy.wrap(user).as('testUser');
      cy.login(user.email, user.password);
    });

    // Visit settings and wait for hydration
    cy.visitAndWaitForHydration('/settings/account');
  });

  describe('Your account settings', function () {
    beforeEach(() => {
      // TODO: Recheck when left side nav is fixed
      //   cy.get('[data-cy="account-settings-btn"]').should('be.visible').click();
      cy.url().should('include', '/settings/account');
    });
    describe('Username settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="username-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/account/username');
      });
      it('should display current username', function () {
        cy.get('input[data-cy="username-settings-input"]').should(
          'have.value',
          this.testUser.username,
        );
      });

      it('should show username suggestions', function () {
        cy.get('[data-cy="username-suggestions-list"] button').should('have.length.greaterThan', 0);
      });

      it('should not allow saving invalid usernames', function () {
        cy.get('input[data-cy="username-settings-input"]').clear();
        cy.get('button[data-cy="username-settings-save"]').should('be.disabled');
        cy.get('input[data-cy="username-settings-input"]').type('in valid');
        cy.get('button[data-cy="username-settings-save"]').should('be.disabled');
      });

      it('should allow changing username to a valid custom username', function () {
        const newUsername = `test_user${Math.floor(Math.random() * 10000)}`;
        cy.get('input[data-cy="username-settings-input"]').clear().type(newUsername);
        cy.get('button[data-cy="username-settings-save"]').should('not.be.disabled').click();
        // Verify success notification
        cy.url().should('include', '/settings/account');
        cy.get('[data-cy="username-settings-btn"]').should('contain.text', newUsername);
      });

      it('should allow changing username to a suggestion', function () {
        const btn = cy.get('[data-cy="username-suggestions-list"] button').first();
        btn.then(($button) => {
          const suggestedUsername = $button.text().trim();
          btn.click();
          cy.get('input[data-cy="username-settings-input"]').should(
            'have.value',
            suggestedUsername,
          );
          cy.get('button[data-cy="username-settings-save"]').should('not.be.disabled').click();
          // Verify success notification
          cy.url().should('include', '/settings/account');
          cy.get('[data-cy="username-settings-btn"]').should('contain.text', suggestedUsername);
        });
      });
    });

    describe('Email settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="email-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/account/email');
      });

      it('should display current email', function () {
        cy.get('input[data-cy="email-settings-input"]').should('be.disabled');
        cy.get('input[data-cy="email-settings-input"]').should('have.value', this.testUser.email);
      });

      it('should open change email dialog', function () {
        cy.get('button[data-cy="email-settings-change-btn"]').should('be.visible').click();
        cy.get('[data-cy="change-email-form"]').should('be.visible');
      });

      it('should not allow submitting invalid email', function () {
        cy.get('button[data-cy="email-settings-change-btn"]').should('be.visible').click();
        cy.get('[data-cy="change-email-form"]').should('be.visible');

        cy.get('input[data-cy="change-email-form-input"]').type('invalid-email');
        cy.get('button[data-cy="change-email-form-next-btn"]').should('be.disabled');

        cy.contains('Please enter a valid email').should('be.visible');
      });

      it('should not allow submitting a used email', function () {
        cy.get('button[data-cy="email-settings-change-btn"]').should('be.visible').click();
        cy.get('[data-cy="change-email-form"]').should('be.visible');

        // Use an email that is already registered
        cy.fixture('auth/existingUser.json').then((existingUser) => {
          cy.get('input[data-cy="change-email-form-input"]').type(existingUser.email);
          cy.get('button[data-cy="change-email-form-next-btn"]').should('not.be.disabled').click();

          // Verify error message
          cy.contains('An account with this email already exists').should('be.visible');
        });
      });

      it('should allow submitting a new valid email', function () {
        cy.get('button[data-cy="email-settings-change-btn"]').should('be.visible').click();
        cy.get('[data-cy="change-email-form"]').should('be.visible');

        const newEmail = `testuser${Math.floor(Math.random() * 10000)}@example.com`;
        cy.get('input[data-cy="change-email-form-input"]').type(newEmail);
        cy.get('button[data-cy="change-email-form-next-btn"]').should('not.be.disabled').click();

        // Verify otp
        cy.get('[data-cy="change-email-otp-form"]').should('be.visible');
        cy.getOTP(this.testUser.id, 'changeEmail').then((otp) => {
          cy.get('input[data-cy="change-email-otp-input"]').type(otp);
          cy.get('button[data-cy="change-email-otp-next-btn"]').should('not.be.disabled').click();

          // Verify success notification and updated email display
          cy.url().should('include', '/settings/account');
          cy.get('[data-cy="email-settings-btn"]').should('contain.text', newEmail);
        });
      });
    });

    describe('Password settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="password-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/account/changePasswordEditor');
        cy.get('form[data-cy="change-password-form"]').should('be.visible');
      });

      it('should not allow submitting invalid current password', function () {
        cy.get('input[data-cy="chg-pwd-current"]').type('wrongpassword');
        cy.get('input[data-cy="chg-pwd-new"]').type('NewPassword123!');
        cy.get('input[data-cy="chg-pwd-confirm"]').type('NewPassword123!');
        cy.get('button[data-cy="chg-pwd-save"]').should('not.be.disabled').click();

        // Should remain on the same form and not proceed
        cy.get('button[data-cy="chg-pwd-save"]').should('be.disabled');

        // TODO: Verify error message
      });

      it('should not allow submitting weak new password', function () {
        cy.get('input[data-cy="chg-pwd-current"]').type(this.testUser.password);
        cy.get('input[data-cy="chg-pwd-new"]').type('123');
        cy.get('input[data-cy="chg-pwd-confirm"]').type('123');
        cy.get('button[data-cy="chg-pwd-save"]').should('be.disabled');
      });

      it('should not allow submitting non-matching confirm password', function () {
        cy.get('input[data-cy="chg-pwd-current"]').type(this.testUser.password);
        cy.get('input[data-cy="chg-pwd-new"]').type('NewPassword123!');
        cy.get('input[data-cy="chg-pwd-confirm"]').type('DifferentPassword123!');
        cy.get('button[data-cy="chg-pwd-save"]').should('be.disabled');
        cy.contains('Passwords do not match').should('be.visible');
      });

      it('should not allow using the same old password', function () {
        cy.get('input[data-cy="chg-pwd-current"]').type(this.testUser.password);
        cy.get('input[data-cy="chg-pwd-new"]').type(this.testUser.password);
        cy.get('input[data-cy="chg-pwd-confirm"]').type(this.testUser.password);
        cy.get('button[data-cy="chg-pwd-save"]').click();
        cy.get('button[data-cy="chg-pwd-save"]').should('be.disabled');
        // TODO: Verify appropriate error message
      });

      it('should allow changing password with valid inputs', function () {
        const newPassword = 'NewPassword@123';
        cy.get('input[data-cy="chg-pwd-current"]').type(this.testUser.password);
        cy.get('input[data-cy="chg-pwd-new"]').type(newPassword);
        cy.get('input[data-cy="chg-pwd-confirm"]').type(newPassword);
        cy.get('button[data-cy="chg-pwd-save"]').should('not.be.disabled').click();
        // Verify success by navigation back to account settings
        cy.url().should('include', '/settings/account');
      });
    });

    describe('Birth Date settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="dob-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/profile');
        cy.get('[data-cy="birth-date-select"]').should('exist');
      });

      it('should display current birth date selection', function () {
        const birthdate = new Date(this.testUser.birthdate);
        const birthYear = birthdate.getUTCFullYear().toString();
        const birthMonth = (birthdate.getUTCMonth() + 1).toString(); // Months are 0-indexed in JS Date
        const birthDay = birthdate.getUTCDate().toString();
        cy.get('select[data-cy="birth-year-select"]').should('have.value', birthYear);
        cy.get('select[data-cy="birth-month-select"]').should('have.value', birthMonth);
        cy.get('select[data-cy="birth-day-select"]').should('have.value', birthDay);
      });

      it('should not allow birth date younger than 13 YO', function () {
        const currentYear = new Date().getUTCFullYear();
        const underageYear = (currentYear - 10).toString(); // 10 years old
        cy.get('select[data-cy="birth-year-select"]').select(underageYear);
        cy.contains('You must be at least 13 years old').should('be.visible');
        cy.get('button[data-cy="profile-save-btn"]').should('be.disabled');
      });

      it('should allow changing birth date', function () {
        // Select new birth date
        cy.get('select[data-cy="birth-year-select"]').select('1995');
        cy.get('select[data-cy="birth-month-select"]').select('5'); // May
        cy.get('select[data-cy="birth-day-select"]').select('15');
        cy.get('button[data-cy="profile-save-btn"]').should('not.be.disabled').click();

        cy.url().should('include', `/profile/${this.testUser.username}`);
      });
    });
  });
});
