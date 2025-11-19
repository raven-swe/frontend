// cypress/e2e/auth/signup.cy.ts

describe('Settings Actions', () => {
  beforeEach(() => {
    // Create a test user and store it as an alias
    cy.createTestUser().then((user) => {
      cy.wrap(user).as('testUser');
      cy.login(user.email, user.password);
    });

    // Visit home and wait for hydration
    cy.visitAndWaitForHydration('/home');

    // Navigate to settings page
    cy.get('[data-cy="sidebar-settings-btn"]').should('be.visible').click();
    cy.url().should('include', '/settings/account');
  });

  describe('Your account settings', () => {
    // beforeEach(() => {
    //     cy.get('[data-cy="account-settings-btn"]').should('be.visible').click();
    //     cy.url().should('include', '/settings/account');
    // });
    describe('Username settings', () => {
      beforeEach(() => {
        cy.get('[data-cy="username-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/username');
      });
      it('should display current username', function () {
        cy.get('input[data-cy="username-settings-input"]').should(
          'have.value',
          this.testUser.username,
        );
      });

      it('should show username suggestions', () => {
        cy.get('[data-cy="username-suggestions-list"] button').should('have.length.greaterThan', 0);
      });

      it('should not allow saving invalid usernames', () => {
        cy.get('input[data-cy="username-settings-input"]').clear();
        cy.get('button[data-cy="username-settings-save"]').should('be.disabled');
        cy.get('input[data-cy="username-settings-input"]').type('in valid');
        cy.get('button[data-cy="username-settings-save"]').should('be.disabled');
      });

      it('should allow changing username to a valid custom username', () => {
        const newUsername = `test_user${Math.floor(Math.random() * 10000)}`;
        cy.get('input[data-cy="username-settings-input"]').clear().type(newUsername);
        cy.get('button[data-cy="username-settings-save"]').should('not.be.disabled').click();
        // Verify success notification
        cy.url().should('include', '/settings/account');
        cy.get('[data-cy="username-settings-btn"]').should('contain.text', newUsername);
      });

      it('should allow changing username to a suggestion', () => {
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
  });
});
