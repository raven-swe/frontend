import { createTestUser } from '../../support/helpers/createTestUser';

describe('Onboarding Flow', { testIsolation: false }, function () {
  before(function () {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visitAndWaitForHydration('/');
    cy.get('button[data-cy="signup-start-button"]').should('be.visible').click();
    cy.get('[data-cy="signup-info-form"]').should('be.visible');
    // Sign up a new user before tests
    const user = createTestUser();
    cy.wrap(user).as('testUser');

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
  describe('Upload profile picture Form', function () {
    it('should display profile picture upload dialog after signup', function () {
      cy.get('[data-cy="profile-setup-avatar-dialog"]').should('exist');
      cy.get('button[data-cy="profile-setup-next-button"]').contains('Skip');
    });

    it('should upload profile picture and proceed to next step', function () {
      const avatarImagePath = 'cypress/fixtures/profile/avatar.png';
      cy.get('input[data-cy="profile-setup-avatar-file-input"]').selectFile(avatarImagePath, {
        force: true,
      });
      cy.get('img[data-cy="profile-setup-avatar-image"]')
        .should('have.attr', 'src')
        .and('not.be.empty');
      cy.get('button[data-cy="profile-setup-next-button"]').contains('Next').click();
      cy.get('[data-cy="edit-username-form"]').should('exist');
    });
  });
  describe('Set username Form', function () {
    it('it should display username changing form with initial data', function () {
      cy.get('input[data-cy="username-input"]').should('be.visible');
      // should contain initial username suggestion (not empty)
      cy.get('input[data-cy="username-input"]').invoke('val').should('not.be.empty');
    });
    it('should show skip button if no username is set', function () {
      cy.get('input[data-cy="username-input"]').clear();
      cy.get('button[data-cy="username-next-button"]').contains('Skip').should('be.visible');
    });

    it('should enable next button when a valid username is entered', function () {
      const uniqueUsername = `testuser${Date.now()}`.slice(0, 15);
      cy.get('input[data-cy="username-input"]').clear().type(uniqueUsername);
      cy.get('button[data-cy="username-next-button"]').contains('Next').should('not.be.disabled');
    });
    it('should show username suggestions when typing', function () {
      cy.get('input[data-cy="username-input"]').clear().type('testuser');
      cy.get('[data-cy="username-suggestions-list"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="username-suggestion-button"]', { timeout: 10000 })
        .its('length')
        .should('be.gte', 1);
    });
    it('should select a username suggestion when clicked', function () {
      cy.get('[data-cy="username-suggestion-button"]')
        .first()
        .then(($button) => {
          const suggestedUsername = $button.text().trim();
          cy.wrap($button).click();
          cy.get('input[data-cy="username-input"]').should('have.value', suggestedUsername);
        });
    });

    it('should proceed to home after setting username', function () {
      cy.get('button[data-cy="username-next-button"]').contains('Next').click();
      cy.get('form[data-cy="select-interests-form"]', { timeout: 10000 }).should('exist');
      cy.get('div[data-cy="follow-suggestion-list"]').should('exist');
    });
  });

  describe('Select interests Form', function () {
    it('should display interests selection form', function () {
      cy.get('form[data-cy="select-interests-form"]').should('be.visible');
      cy.get('button[data-cy="interest-button"]', { timeout: 10000 }).should('have.length.gte', 1);
    });
    it('should show no interests selected at first', function () {
      cy.get('p[data-cy="no-interests-selected"]').should('be.visible');
    });
    it('should allow selecting interests and enable next button', function () {
      cy.get('button[data-cy="interest-button"]').first().click();
      cy.get('p[data-cy="no-interests-selected"]').should('not.exist');
      cy.get('p[data-cy="interests-selected"]').should('be.visible');
      cy.get('button[data-cy="interests-next-button"]').contains('Next').should('not.be.disabled');
    });
    it('should complete onboarding and redirect to home', function () {
      cy.get('button[data-cy="interests-next-button"]').contains('Next').click();
      cy.get('div[data-cy="follow-suggestion-list"]').should('exist');
    });
  });

  describe('Follow suggestions Form', function () {
    it('should display follow suggestions list', function () {
      cy.get('div[data-cy="follow-suggestion-list"]').should('be.visible');
      // should show at least one follow suggestion item
      cy.get('div[data-cy="user-row"]', { timeout: 10000 }).should('have.length.gte', 1);
      cy.get('button[data-cy="onboarding-follow-users-next-button"]')
        .contains('Next')
        .should('be.disabled');
    });
    it('should be able to navigate to a suggested user profile', function () {
      cy.get('div[data-cy="user-row"]')
        .first()
        .within(($row) => {
          // data-cy="user-row" has data-cy="user-row-username", which we can use to check url after clicking
          // div with @username, we should click on the component itself
          cy.get('[data-cy="user-row-username"]').then(($usernameDiv) => {
            const username = $usernameDiv.text().trim().replace('@', '');
            cy.wrap($row).click({ force: true });
            cy.url().should('include', `/profile/${username}`);
          });
        });
      // Go back to follow suggestions
      cy.go('back');
      cy.get('div[data-cy="follow-suggestion-list"]').should('be.visible');
    });
    it('should allow following users and enable next button', function () {
      cy.get('button[data-cy="profile-follow-button"]').first().click({ force: true });
      cy.get('button[data-cy="onboarding-follow-users-next-button"]')
        .contains('Next')
        .should('not.be.disabled');
    });
    it('should proceed to interests selection after following users', function () {
      cy.get('button[data-cy="onboarding-follow-users-next-button"]').contains('Next').click();
      cy.url().should('include', '/home');
    });
  });
});
