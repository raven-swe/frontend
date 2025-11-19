// cypress/e2e/auth/signup.cy.ts

describe('Settings Actions', () => {
  beforeEach(() => {
    // Load user fixture and login with session caching
    cy.fixture('settings/user.json').then((user) => {
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
      it('should display current username', () => {
        cy.fixture('settings/user.json').then((user) => {
          cy.get('input[data-cy="username-settings-input"]').should('have.value', user.username);
        });
      });

      it('should show username suggestions', () => {
        cy.get('[data-cy="username-suggestions-list"] button').should('have.length.greaterThan', 0);
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
        });
        cy.get('button[data-cy="username-settings-save"]').should('not.be.disabled');
      });
    });
  });
});
