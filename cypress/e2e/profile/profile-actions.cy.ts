describe('Profile Page Actions', () => {
  beforeEach(() => {
    // Create two test users: slave user and master user
    cy.createTestUser().then((masterUser) => {
      cy.createTestUser().then((slaveUser) => {
        cy.wrap(masterUser).as('masterUser');
        cy.wrap(slaveUser).as('slaveUser');
        // Login as master user
        cy.login(masterUser.email, masterUser.password);
        cy.loginExternal(slaveUser.email, slaveUser.password);
      });
    });
  });
  describe('Profile User Actions', () => {
    it('should follow and unfollow a user', function () {
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}`);
      cy.get('[data-cy="profile-follow-button"]').should('exist').click();
      // Check button changes to unfollow
      cy.get('[data-cy="profile-unfollow-button"]').should('exist');
      // Check followers count increased
      cy.get('[data-cy="profile-followers-count"]').should('contain.text', '1');
      // Now unfollow
      cy.get('[data-cy="profile-unfollow-button"]').should('exist').click();
      // Check button changes to follow
      cy.get('[data-cy="profile-follow-button"]').should('exist');
      // Check followers count decreased
      cy.get('[data-cy="profile-followers-count"]').should('contain.text', '0');
    });

    it('should mute and unmute a user', function () {
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}`);
      cy.get('[data-cy="profile-action-buttons"]').should('exist').click();
      cy.get('[data-cy="mute-button"]').should('exist').should('contain.text', 'Mute').click();
      cy.get('[data-cy="profile-muted-info"]').should('exist');
      // Now unmute
      cy.get('[data-cy="profile-action-buttons"]').should('exist').click();
      cy.get('[data-cy="mute-button"]').should('exist').should('contain.text', 'Unmute').click();
      cy.get('[data-cy="profile-muted-info"]').should('not.exist');
    });

    it('should block and unblock a user', function () {
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}`);
      cy.get('[data-cy="profile-action-buttons"]').should('exist').click();
      cy.get('[data-cy="block-button"]').should('exist').should('contain.text', 'Block').click();
      cy.get('[data-cy="profile-blocked-message"]').should('exist');
      // Now unblock
      cy.get('[data-cy="profile-action-buttons"]').should('exist').click();
      cy.get('[data-cy="block-button"]').should('exist').should('contain.text', 'Unblock').click();
      cy.get('[data-cy="profile-blocked-message"]').should('not.exist');
    });
  });

  describe('Profile Lists', () => {
    it('should display followers and following lists correctly', function () {
      // Follow slave user
      cy.followUser(this.slaveUser.username, true);
      // Slave user follow master user
      cy.followUser(this.masterUser.username, true, true);
      // Check master user's following list
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}/following`);
      cy.get('[data-cy="user-row"]').should('have.length', 1);
      cy.get('[data-cy="user-row"]').first().should('contain.text', this.slaveUser.username);
      // Check slave user's followers list
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/followers`);
      cy.get('[data-cy="user-row"]').should('have.length', 1);
      cy.get('[data-cy="user-row"]').first().should('contain.text', this.masterUser.username);
    });

    it('should be able to follow back and unfollow from followers/following lists', function () {
      // Slave user follow master user
      cy.followUser(this.masterUser.username, true, true);
      // Check master user's followers list
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}/followers`);
      cy.get('[data-cy="user-row"]').should('have.length', 1);
      cy.get('[data-cy="user-row"]').first().should('contain.text', this.slaveUser.username);
      // Follow back
      cy.get('[data-cy="user-row"]')
        .first()
        .within(() => {
          cy.get('[data-cy="profile-follow-button"]').should('contain.text', 'Follow back').click();
          cy.get('[data-cy="profile-unfollow-button"]').should('exist').click();
          cy.get('[data-cy="profile-follow-button"]').should('exist');
        });
    });
  });
});
