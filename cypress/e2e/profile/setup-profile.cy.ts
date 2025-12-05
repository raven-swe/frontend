describe('Setup Profile Actions', function () {
  beforeEach(() => {
    // Create a test user and store it as an alias
    cy.createTestUser().then((user) => {
      cy.wrap(user).as('testUser');
      cy.login(user.email, user.password);
    });
  });

  describe('Navigation to Setup Profile', function () {
    it('should navigate to Setup Profile page from Profile Page', function () {
      cy.visitAndWaitForHydration(`/profile/${this.testUser.username}`);
      cy.get('a[data-cy="profile-setup-button"]').should('exist').click();
      cy.url().should('include', '/setup/profile');
      cy.get('[data-cy="profile-setup-avatar-dialog"]').should('exist');
    });
  });

  describe('Setup Profile Form', function () {
    beforeEach(() => {
      cy.visitAndWaitForHydration(`/setup/profile`);
      cy.get('[data-cy="profile-setup-avatar-dialog"]').should('exist');
    });

    describe('Successful Profile Setup', function () {
      afterEach(function () {
        // Check for edit button existence after each test
        cy.visitAndWaitForHydration(`/profile/${this.testUser.username}`);
        cy.get('[data-cy="profile-edit-button"]').should('exist');
        cy.get('[data-cy="profile-edit-button"]').should('exist').click();
        cy.url().should('include', '/settings/profile');
      });

      it('should successfully update profile with valid data', function () {
        const newBio = 'BIOOOOOOOOOOOOOOOOOOOOOOO.';
        const newLocation = 'Cairo';
        const avatarImagePath = 'cypress/fixtures/profile/avatar.png';
        const bannerImagePath = 'cypress/fixtures/profile/banner.jpg';

        cy.get('input[data-cy="profile-setup-avatar-file-input"]').selectFile(avatarImagePath, {
          force: true,
        });
        cy.get('img[data-cy="profile-setup-avatar-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');

        cy.get('button[data-cy="profile-setup-next-button"]').contains('Next').click();

        cy.get('[data-cy="profile-setup-header-dialog"]').should('exist');

        cy.get('input[data-cy="profile-setup-header-file-input"]').selectFile(bannerImagePath, {
          force: true,
        });
        cy.get('img[data-cy="profile-setup-header-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');

        cy.get('button[data-cy="profile-setup-next-button"]').contains('Next').click();

        cy.get('[data-cy="profile-setup-bio-dialog"]').should('exist');

        cy.get('textarea[data-cy="profile-setup-bio-input"]')
          .should('not.be.disabled')
          .clear({ force: true })
          .type(newBio, { force: true });

        cy.get('button[data-cy="profile-setup-next-button"]').contains('Next').click();

        cy.get('[data-cy="profile-setup-location-dialog"]').should('exist');

        cy.get('input[data-cy="profile-setup-location-input"]')
          .should('not.be.disabled')
          .clear({ force: true })
          .type(newLocation, { force: true });

        cy.get('button[data-cy="profile-setup-next-button"]').contains('Next').click();

        cy.get('[data-cy="profile-setup-confirm-dialog"]').should('exist');

        cy.get('button[data-cy="profile-setup-save-button"]').click();

        cy.url().should('include', `/profile/${this.testUser.username}`);

        cy.get('p[data-cy="profile-bio"]').contains(newBio);
        cy.get('span[data-cy="profile-location"]').should('have.text', newLocation);
        cy.get('img[data-cy="profile-avatar"]').should('have.attr', 'src').and('not.be.empty');
        cy.get('img[data-cy="profile-cover-image"]').should('have.attr', 'src').and('not.be.empty');
      });
    });
  });
});
