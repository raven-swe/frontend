describe('Edit Profile Actions', function () {
  beforeEach(() => {
    // Create a test user and store it as an alias
    cy.createTestUser().then((user) => {
      cy.wrap(user).as('testUser');
      cy.login(user.email, user.password);
    });
  });

  describe('Navigation to Edit Profile', function () {
    it('should display the Edit Profile form with all fields', function () {
      cy.visitAndWaitForHydration(`/settings/profile`);
      cy.get('[data-cy="profile-name-input"]').should('exist');
      cy.get('[data-cy="profile-bio-input"]').should('exist');
      cy.get('[data-cy="profile-location-input"]').should('exist');
      cy.get('[data-cy="profile-website-input"]').should('exist');
      cy.get('[data-cy="profile-save-btn"]').should('exist');
      cy.get('[data-cy="birth-date-select"]').should('exist');
      cy.get('[data-cy="birth-month-select"]').should('exist');
      cy.get('[data-cy="birth-year-select"]').should('exist');
      cy.get('[data-cy="birth-day-select"]').should('exist');
      cy.get('[data-cy="edit-profile-avatar-image"]').should('exist');
      cy.get('[data-cy="edit-profile-banner-image"]').should('exist');
    });
  });

  describe('Edit Profile Form', function () {
    beforeEach(() => {
      cy.visitAndWaitForHydration(`/settings/profile`);
    });
    describe('Form Field Validations', function () {
      it('should have a limit on display name', function () {
        // limit is 50 characters, the input should only accept up to that limit
        const longName = 'A'.repeat(60);
        cy.get('input[data-cy="profile-name-input"]').clear().type(longName);
        cy.get('input[data-cy="profile-name-input"]')
          .invoke('val')
          .then((val: string) => {
            expect(val.length).to.be.at.most(50);
          });
      });
      it('should have a limit on bio', function () {
        // limit is 160 characters, the input should only accept up to that limit
        const longBio = 'B'.repeat(200);
        cy.get('textarea[data-cy="profile-bio-input"]').clear().type(longBio);
        cy.get('textarea[data-cy="profile-bio-input"]')
          .invoke('val')
          .then((val: string) => {
            expect(val.length).to.be.at.most(160);
          });
      });

      it('should show validation error for invalid website URL', function () {
        const invalidURL = 'invalid-url';
        cy.get('input[data-cy="profile-website-input"]').clear().type(invalidURL);
        cy.get('[data-cy="profile-save-btn"]').should('be.disabled');
      });

      it('should show validation error for young birth date', function () {
        const currentYear = new Date().getFullYear();
        const youngYear = currentYear - 10;
        cy.get('select[data-cy="birth-year-select"]').select(youngYear.toString());
        cy.get('[data-cy="profile-save-btn"]').should('be.disabled');
      });

      it('should allow updating profile picture and banner', function () {
        const avatarImagePath = 'cypress/fixtures/profile/avatar.png';
        const bannerImagePath = 'cypress/fixtures/profile/banner.jpg';

        cy.get('input[data-cy="edit-profile-avatar-file-input"]').selectFile(avatarImagePath, {
          force: true,
        });
        cy.get('img[data-cy="edit-profile-avatar-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');

        cy.get('input[data-cy="edit-profile-banner-file-input"]').selectFile(bannerImagePath, {
          force: true,
        });
        cy.get('img[data-cy="edit-profile-banner-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');

        cy.get('[data-cy="profile-save-btn"]').should('not.be.disabled');
      });
    });

    describe('Successful Profile Update', function () {
      afterEach(function () {
        // Check for edit button existence after each test
        cy.visitAndWaitForHydration(`/profile/${this.testUser.username}`);
        cy.get('[data-cy="profile-edit-button"]').should('exist');
        cy.get('[data-cy="profile-edit-button"]').should('exist').click();
        cy.url().should('include', '/settings/profile');
      });

      it('should successfully update profile with valid data', function () {
        const newName = 'Amr Samy';
        const newBio = 'BIOOOOOOOOOOOOOOOOOOOOOOO.';
        const newLocation = 'Cairo';
        const newWebsite = 'https://www.raven.com';
        const avatarImagePath = 'cypress/fixtures/profile/avatar.png';
        const bannerImagePath = 'cypress/fixtures/profile/banner.jpg';

        cy.get('input[data-cy="edit-profile-avatar-file-input"]').selectFile(avatarImagePath, {
          force: true,
        });
        cy.get('img[data-cy="edit-profile-avatar-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');

        cy.get('input[data-cy="edit-profile-banner-file-input"]').selectFile(bannerImagePath, {
          force: true,
        });
        cy.get('img[data-cy="edit-profile-banner-image"]')
          .should('have.attr', 'src')
          .and('not.be.empty');
        cy.get('input[data-cy="profile-name-input"]').clear().type(newName);
        cy.get('textarea[data-cy="profile-bio-input"]').clear().type(newBio);
        cy.get('input[data-cy="profile-location-input"]').clear().type(newLocation);
        cy.get('input[data-cy="profile-website-input"]').clear().type(newWebsite);
        cy.get('select[data-cy="birth-year-select"]').select('1990');
        cy.get('select[data-cy="birth-month-select"]').select('January');
        cy.get('select[data-cy="birth-day-select"]').select('1');
        cy.get('[data-cy="profile-save-btn"]').click();
        cy.url().should('include', `/profile/${this.testUser.username}`);
        cy.get('h2[data-cy="profile-display-name"]').should('have.text', newName);
        cy.get('p[data-cy="profile-bio"]').contains(newBio);
        cy.get('span[data-cy="profile-location"]').should('have.text', newLocation);
        cy.get('span[data-cy="profile-website-url"]').should('have.text', newWebsite);
        cy.get('img[data-cy="profile-avatar"]').should('have.attr', 'src').and('not.be.empty');
        cy.get('img[data-cy="profile-cover-image"]').should('have.attr', 'src').and('not.be.empty');
      });
    });
  });
});
